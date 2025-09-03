
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReferenceImageUpload } from "@/hooks/useReferenceImageUpload";
import { useImageGenerationAPI } from "@/hooks/useImageGenerationAPI";
import { useCreateImageWithGemini } from "@/services/geminiImageGeneration";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

export const useImageGeneration = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  
  // State management
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [provider, setProvider] = useState<string>("openai");

  // Image generation API hooks
  const {
    createImage: createImageOpenAI,
    isGenerating: isGeneratingOpenAI,
    generatedImageUrl: generatedImageUrlOpenAI,
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

  // Reference image upload hook
  const { uploadReferenceImage } = useReferenceImageUpload();

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
      
    } catch (error) {
      console.error("💥 Error in handleGenerate:", error);
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

  // Combine results from both providers
  const isGenerating = provider === "gemini" ? isGeneratingGemini : isGeneratingOpenAI;
  const generatedImageUrl = provider === "gemini" ? geminiResult?.imageUrl : generatedImageUrlOpenAI;
  const isSuccess = provider === "gemini" ? isSuccessGemini : isSuccessOpenAI;
  const currentError = provider === "gemini" ? errorGemini : errorOpenAI;

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
    session,
    handleGenerate,
    subscriptionStatus,
    canGenerateImage,
    remainingImages,
  };
};
