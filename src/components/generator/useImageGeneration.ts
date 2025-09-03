
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReferenceImageUpload } from "@/hooks/useReferenceImageUpload";
import { useImageGenerationAPI } from "@/hooks/useImageGenerationAPI";
import { useCreateImageWithGemini } from "@/services/geminiImageGeneration";
import { useCreateImageWithXAI } from "@/services/xaiImageGeneration";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useProviderMetrics } from "@/hooks/useProviderMetrics";

export const useImageGeneration = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const { recordGenerationTime } = useProviderMetrics();
  
  // State management
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [provider, setProvider] = useState<string>("openai");

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
    const startTime = Date.now();
    
    console.log("🎯 handleGenerate called with:", {
      prompt,
      selectedItem,
      selectedRatio,
      hasReferenceImage: !!referenceImage,
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
      console.log("📁 Uploading reference image if provided...");
      
      // Upload reference image if provided
      let referenceImageUrl: string | undefined;
      if (referenceImage) {
        referenceImageUrl = await uploadReferenceImage(referenceImage);
        console.log("✅ Reference image uploaded:", referenceImageUrl);
      }

      console.log(`🎨 Starting image generation with ${provider}...`);
      
      // Generate image based on selected provider
      if (provider === "gemini") {
        createImageGemini({
          prompt,
          itemType: selectedItem,
          aspectRatio: selectedRatio,
          referenceImageUrl,
        });
      } else if (provider === "xai") {
        createImageXAI({
          prompt,
          itemType: selectedItem,
          aspectRatio: selectedRatio,
          referenceImageUrl,
        });
      } else {
        createImageOpenAI({
          prompt,
          itemType: selectedItem,
          aspectRatio: selectedRatio,
          referenceImageUrl,
        });
      }

      // Open preview dialog
      setPreviewOpen(true);
      
      // Refresh subscription status
      refetchStatus();

      // Record generation metrics on completion
      const recordMetrics = () => {
        const endTime = Date.now();
        const isSuccessful = provider === "gemini" ? isSuccessGemini : 
                            provider === "xai" ? isSuccessXAI : isSuccessOpenAI;
        recordGenerationTime(provider, startTime, endTime, isSuccessful);
      };

      // Set timeout to record metrics after generation attempt
      setTimeout(recordMetrics, 1000);
      
    } catch (error) {
      console.error("💥 Error in handleGenerate:", error);
      
      // Record failed generation
      const endTime = Date.now();
      recordGenerationTime(provider, startTime, endTime, false);
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  }, [
    prompt,
    selectedItem,
    selectedRatio,
    referenceImage,
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
    setPreviewOpen,
    refetchStatus
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
