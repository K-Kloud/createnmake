
import { useState, useCallback } from "react";
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

  // Smart provider fallback hook
  const hasAnyReference = !!(referenceImage || referenceImages.length > 0);
  const { providerOrder } = useSmartProviderFallback(provider, hasAnyReference);

  // Image generation API hooks
  const {
    createImage: createImageOpenAI,
    isGenerating: isGeneratingOpenAI,
    generatedImageUrl: generatedImageUrlOpenAI,
    generatedImageId: generatedImageIdOpenAI,
    error: errorOpenAI,
    isSuccess: isSuccessOpenAI
  } = useImageGenerationAPI();

  const {
    mutate: createImageGemini,
    isPending: isGeneratingGemini,
    data: geminiResult,
    error: errorGemini,
    isSuccess: isSuccessGemini
  } = useCreateImageWithGemini();

  const {
    mutate: createImageXAI,
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
    const generationStartTime = Date.now();
    setStartTime(generationStartTime);
    const startTime = Date.now();
    
    console.log("🎯 handleGenerate called with:", {
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
      return;
    }

    // Validate required fields
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Prompt",
        description: "Please describe what you want to create.",
      });
      return;
    }

    if (!selectedItem) {
      toast({
        variant: "destructive", 
        title: "Missing Item Type",
        description: "Please select a clothing item type.",
      });
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
      return;
    }

    try {
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

      console.log(`🎨 Starting image generation with ${provider}...`);
      
      // Open preview dialog BEFORE generation starts
      setPreviewOpen(true);
      
      // Try providers with smart fallback logic
      const providers = providerOrder;
      
      let lastError = null;
      
      for (const currentProvider of providers) {
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
          
          // Call the appropriate provider
          if (currentProvider === 'gemini') {
            createImageGemini(params);
          } else if (currentProvider === 'xai') {
            createImageXAI(params);
          } else if (currentProvider === 'huggingface') {
            // Call Hugging Face API directly
            const { data, error } = await supabase.functions.invoke('generate-image-huggingface', {
              body: params,
            });
            
            if (!data?.success) {
              throw new Error(data?.error || 'Hugging Face generation failed');
            }
          } else {
            // Default to OpenAI
            createImageOpenAI(params);
          }

          // Record metrics and learning on success
          const endTime = Date.now();
          recordGenerationTime(currentProvider, startTime, endTime, true);
          learnFromGeneration(prompt, selectedItem, true, 5);
          
          toast({
            title: "Success!",
            description: `Image generated successfully with ${currentProvider}`,
          });
          
          // Refresh subscription status
          refetchStatus();
          
          return; // Success, exit function
          
        } catch (error) {
          console.error(`❌ Provider ${currentProvider} failed:`, error);
          lastError = error;
          
          // Record failed generation
          const endTime = Date.now();
          recordGenerationTime(currentProvider, startTime, endTime, false);
          learnFromGeneration(prompt, selectedItem, false, 1);
          
          // Continue to next provider
          continue;
        }
      }
      
      // If we get here, all providers failed
      throw lastError || new Error('All image generation providers failed');
      
    } catch (error) {
      console.error("💥 Error in handleGenerate:", error);
      
      // Record failed generation
      const endTime = Date.now();
      recordGenerationTime(provider, startTime, endTime, false);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "All providers failed. Please try again later.",
        duration: 8000,
      });
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
    setAuthDialogOpen,
    toast,
    uploadReferenceImage,
    createImageOpenAI,
    createImageGemini,
    createImageXAI,
    geminiResult,
    xaiResult,
    generatedImageUrlOpenAI,
    generatedImageIdOpenAI,
    setPreviewOpen,
    refetchStatus,
    recordGenerationTime
  ]);

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
