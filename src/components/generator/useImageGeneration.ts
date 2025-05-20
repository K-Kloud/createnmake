
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReferenceImageUpload } from "@/hooks/useReferenceImageUpload";
import { useImageGenerationAPI } from "@/hooks/useImageGenerationAPI";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useSubscription } from "@/hooks/useSubscription";

export const useImageGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("product");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  
  // Use our new smaller hooks
  const { referenceImage, setReferenceImage, uploadReferenceImage } = useReferenceImageUpload();
  const { createImage, isGenerating, generatedImageUrl } = useImageGenerationAPI();
  const { authDialogOpen, setAuthDialogOpen, isSignedIn, session } = useAuthDialog();
  const { 
    subscriptionStatus, 
    canGenerateImage, 
    remainingImages,
    refetchStatus
  } = useSubscription();

  // Handle generate button click
  const handleGenerate = async () => {
    if (!isSignedIn) {
      setAuthDialogOpen(true);
      return;
    }

    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt",
      });
      return;
    }

    // Check subscription limits
    if (!canGenerateImage) {
      // Prompt for upgrade
      toast({
        variant: "destructive",
        title: "Image Limit Reached",
        description: `You've reached your ${subscriptionStatus?.monthly_image_limit || 5} image limit for this month. Please upgrade your subscription to generate more images.`,
      });
      return;
    }

    try {
      // Upload reference image if provided
      let referenceImageUrl = null;
      if (referenceImage) {
        referenceImageUrl = await uploadReferenceImage(referenceImage);
        if (!referenceImageUrl) return; // Upload failed
      }

      // Call the generate image function with all parameters
      createImage({
        prompt,
        itemType: selectedItem,
        aspectRatio: selectedRatio,
        referenceImageUrl,
      });
      
      // Open preview dialog when generation starts
      setPreviewOpen(true);
      
      // Refresh subscription status after generating an image
      refetchStatus();
    } catch (error: any) {
      console.error("Generation preparation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to prepare for image generation",
      });
    }
  };

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
