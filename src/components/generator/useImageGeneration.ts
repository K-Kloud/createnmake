
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReferenceImageUpload } from "@/hooks/useReferenceImageUpload";
import { useImageGenerationAPI } from "@/hooks/useImageGenerationAPI";
import { useCreateImageWithGemini } from "@/services/geminiImageGeneration";
import { useCreateImageWithXAI } from "@/services/xaiImageGeneration";
import { supabase } from "@/integrations/supabase/client";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useProviderMetrics } from "@/hooks/useProviderMetrics";
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGenerationHistory } from '@/hooks/useGenerationHistory';
import { useSmartProviderFallback } from "@/hooks/useSmartProviderFallback";
import { analyzeReferenceImage, generateEnhancedPromptFromAnalysis } from "@/services/imageAnalysis";
import { ReferenceType } from "@/components/generator/ReferenceTypeSelector";

export const useImageGeneration = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const { recordGenerationTime } = useProviderMetrics();
  const { learnFromGeneration } = useUserPreferences();
  const { addGeneration } = useGenerationHistory();
  
  // State management
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceType, setReferenceType] = useState<ReferenceType>('style');
  const [provider, setProvider] = useState<string>("gemini");
  const [startTime, setStartTime] = useState<number | undefined>();
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  // Smart provider fallback hook
  const hasAnyReference = !!(referenceImage || referenceImages.length > 0);
  const { providerOrder } = useSmartProviderFallback(provider, hasAnyReference);

  // Image generation API hooks
  const {
    createImage: createImageOpenAI,
    createImageAsync: createImageOpenAIAsync,
    isGenerating: isGeneratingOpenAI,
    generatedImageUrl: generatedImageUrlOpenAI,
    generatedImageId: generatedImageIdOpenAI,
    error: errorOpenAI,
    isSuccess: isSuccessOpenAI
  } = useImageGenerationAPI();

  const {
    mutate: createImageGemini,
    mutateAsync: createImageGeminiAsync,
    isPending: isGeneratingGemini,
    data: geminiResult,
    error: errorGemini,
    isSuccess: isSuccessGemini
  } = useCreateImageWithGemini();

  const {
    mutate: createImageXAI,
    mutateAsync: createImageXAIAsync,
    isPending: isGeneratingXAI,
    data: xaiResult,
    error: errorXAI,
    isSuccess: isSuccessXAI
  } = useCreateImageWithXAI();

  // Reference image upload hook
  const { uploadReferenceImage, uploading: uploadingReference } = useReferenceImageUpload();

  // Auth dialog hook
  const { authDialogOpen, setAuthDialogOpen } = useAuthDialog();

  // Subscription and limits
  const {
    subscriptionStatus,
    canGenerateImage,
    remainingImages,
    refetchStatus
  } = useSubscription();

  // Main generation handler
  const handleGenerate = useCallback(async () => {
    const generationId = Math.random().toString(36);
    setCurrentGenerationId(generationId);
    
    const generationStartTime = Date.now();
    setStartTime(generationStartTime);
    
    console.log("🎯 handleGenerate called with:", {
      generationId,
      prompt,
      selectedItem,
      selectedRatio,
      hasReferenceImage: hasAnyReference,
      referenceType,
      multipleReferences: referenceImages.length,
      isAuthenticated: !!session?.user,
      canGenerate: canGenerateImage,
      remainingImages,
      provider
    });

    // Check authentication
    if (!session?.user) {
      console.log("❌ User not authenticated, opening auth dialog");
      setAuthDialogOpen(true);
      setCurrentGenerationId(null);
      return;
    }

    // Validate required fields
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Prompt",
        description: "Please describe what you want to create.",
      });
      setCurrentGenerationId(null);
      return;
    }

    if (!selectedItem) {
      toast({
        variant: "destructive", 
        title: "Missing Item Type",
        description: "Please select a clothing item type.",
      });
      setCurrentGenerationId(null);
      return;
    }

    // Check generation limits
    if (!canGenerateImage) {
      console.log("❌ Generation limit reached");
      toast({
        variant: "destructive",
        title: "Generation Limit Reached",
        description: `You've reached your monthly limit of ${subscriptionStatus?.monthly_image_limit} images. Upgrade your plan to generate more.`,
        duration: 5000,
      });
      setCurrentGenerationId(null);
      return;
    }

    try {
      // Check if generation was cancelled
      if (currentGenerationId !== generationId) {
        console.log("🚫 Generation cancelled due to new request");
        return;
      }

      console.log("📁 Uploading reference images if provided...");
      
      // Upload reference images if provided
      let referenceImageUrl: string | undefined;
      const referenceImageUrls: string[] = [];
      
      // Handle single reference image
      if (referenceImage) {
        referenceImageUrl = await uploadReferenceImage(referenceImage);
        console.log("✅ Single reference image uploaded:", referenceImageUrl);
      }
      
      // Handle multiple reference images
      if (referenceImages.length > 0) {
        for (const img of referenceImages) {
          try {
            const url = await uploadReferenceImage(img);
            referenceImageUrls.push(url);
            console.log("✅ Multiple reference image uploaded:", url);
          } catch (error) {
            console.warn("⚠️ Failed to upload reference image:", error);
          }
        }
        
        // Use first image as primary reference for legacy compatibility
        if (referenceImageUrls.length > 0 && !referenceImageUrl) {
          referenceImageUrl = referenceImageUrls[0];
        }
      }

      // Check if generation was cancelled during upload
      if (currentGenerationId !== generationId) {
        console.log("🚫 Generation cancelled during upload");
        return;
      }

      console.log(`🎨 Starting image generation with providers in order: ${providerOrder.join(', ')}`);
      
      // Try providers sequentially with proper async waiting
      const providers = providerOrder;
      
      for (const currentProvider of providers) {
        // Check if generation was cancelled
        if (currentGenerationId !== generationId) {
          console.log("🚫 Generation cancelled during provider iteration");
          return;
        }

        try {
          console.log(`🔄 Attempting generation with provider: ${currentProvider}`);
          
          const params = {
            prompt,
            itemType: selectedItem,
            aspectRatio: selectedRatio,
            referenceImageUrl,
            referenceImageUrls,
            referenceType,
            multipleReferences: referenceImages.length > 0,
          };
          
          let result = null;
          
          if (currentProvider === 'gemini') {
            result = await createImageGeminiAsync(params);
            if (result?.success) {
              result = { imageUrl: result.imageUrl, imageId: result.imageId };
            }
          } else if (currentProvider === 'xai') {
            result = await createImageXAIAsync(params);
            if (result?.imageUrl) {
              result = { imageUrl: result.imageUrl, imageId: result.imageId };
            }
          } else if (currentProvider === 'huggingface') {
            // Call Hugging Face API directly
            const { data, error } = await supabase.functions.invoke('generate-image-huggingface', {
              body: params,
            });
            
            if (data?.success) {
              result = { imageUrl: data.imageUrl, imageId: data.imageId };
            } else {
              throw new Error(data?.error || 'Hugging Face generation failed');
            }
          } else {
            // Default to OpenAI
            result = await createImageOpenAIAsync(params);
            if (result?.imageUrl) {
              result = { imageUrl: result.imageUrl, imageId: result.imageId };
            }
          }

          // Check if generation was cancelled during API call
          if (currentGenerationId !== generationId) {
            console.log("🚫 Generation cancelled during API call");
            return;
          }

          // If successful, process result
          if (result?.imageUrl) {
            console.log(`✅ Generation successful with provider: ${currentProvider}`);
            
            // Record metrics
            const endTime = Date.now();
            recordGenerationTime(currentProvider, generationStartTime, endTime, true);
            
            // Learn from successful generation
            learnFromGeneration(prompt, selectedItem, true, 5);
            
            // Add to generation history
            addGeneration({
              prompt: prompt,
              itemType: selectedItem,
              imageUrl: result.imageUrl,
              referenceImageUrl: referenceImage ? URL.createObjectURL(referenceImage) : undefined,
              provider: currentProvider,
              settings: {
                aspectRatio: selectedRatio,
                model: currentProvider,
                quality: 'high'
              },
              metadata: {
                processingTime: endTime - generationStartTime,
                enhancedPrompt: prompt,
                confidence: 0.9,
                tags: [selectedItem]
              },
              rating: 5,
              isFavorite: false
            });
            
            toast({
              title: "Success!",
              description: `Image generated successfully with ${currentProvider}`,
            });
            
            // Open preview dialog
            setPreviewOpen(true);
            
            // Refresh subscription status
            refetchStatus();
            
            // Clear generation ID
            setCurrentGenerationId(null);
            
            return; // Success, exit function
          }
          
        } catch (error) {
          console.error(`❌ Provider ${currentProvider} failed:`, error);
          
          // Record failed generation
          const endTime = Date.now();
          recordGenerationTime(currentProvider, generationStartTime, endTime, false);
          
          // Learn from failed generation
          learnFromGeneration(prompt, selectedItem, false, 1);
          
          // Continue to next provider only if this wasn't the last one
          if (currentProvider !== providers[providers.length - 1]) {
            console.log(`🔄 Trying next provider...`);
            continue;
          } else {
            // This was the last provider, throw the error
            throw error;
          }
        }
      }
      
      // If we get here, all providers failed
      throw new Error('All image generation providers failed');
      
    } catch (error) {
      console.error("💥 Error in handleGenerate:", error);
      
      // Record failed generation
      const endTime = Date.now();
      recordGenerationTime(provider, generationStartTime, endTime, false);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "All providers failed. Please try again later.",
        duration: 8000,
      });
      
      // Clear generation ID
      setCurrentGenerationId(null);
    }
  }, [
    prompt,
    selectedItem,
    selectedRatio,
    referenceImage,
    referenceImages,
    referenceType,
    session?.user,
    canGenerateImage,
    remainingImages,
    subscriptionStatus?.monthly_image_limit,
    provider,
    providerOrder,
    currentGenerationId,
    setAuthDialogOpen,
    toast,
    uploadReferenceImage,
    createImageOpenAI,
    createImageGemini,
    createImageXAI,
    setPreviewOpen,
    refetchStatus,
    recordGenerationTime,
    learnFromGeneration,
    addGeneration
  ]);

  // Cancel generation on unmount or when starting a new one
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (currentGenerationId) {
        console.log("🧹 Cleaning up generation on unmount:", currentGenerationId);
        setCurrentGenerationId(null);
      }
    };
  }, []);

  // Combine results from all providers
  const isGenerating = provider === "gemini" 
    ? isGeneratingGemini 
    : provider === "xai" 
      ? isGeneratingXAI 
      : isGeneratingOpenAI;
      
  const generatedImageUrl = provider === "gemini" 
    ? geminiResult?.imageUrl 
    : provider === "xai" 
      ? xaiResult?.imageUrl 
      : generatedImageUrlOpenAI;
      
  const generatedImageId = provider === "gemini" 
    ? geminiResult?.imageId 
    : provider === "xai" 
      ? xaiResult?.imageId 
      : generatedImageIdOpenAI;
      
  const isSuccess = provider === "gemini" 
    ? isSuccessGemini 
    : provider === "xai" 
      ? isSuccessXAI 
      : isSuccessOpenAI;
      
  const currentError = provider === "gemini" 
    ? errorGemini 
    : provider === "xai" 
      ? errorXAI 
      : errorOpenAI;

  return {
    prompt,
    setPrompt,
    selectedItem,
    setSelectedItem,
    selectedRatio,
    setSelectedRatio,
    previewOpen,
    setPreviewOpen,
    referenceImage,
    setReferenceImage,
    referenceImages,
    setReferenceImages,
    referenceType,
    setReferenceType,
    provider,
    setProvider,
    isGenerating,
    authDialogOpen,
    setAuthDialogOpen,
    generatedImageUrl,
    generatedImageId,
    session,
    handleGenerate,
    subscriptionStatus,
    canGenerateImage,
    remainingImages,
    uploadingReference
  };
};
