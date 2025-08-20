
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReferenceImageUpload } from "@/hooks/useReferenceImageUpload";
import { useImageGenerationAPI } from "@/hooks/useImageGenerationAPI";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useSubscription } from "@/hooks/useSubscription";

export const useImageGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("tops"); // Changed from "product" to "tops"
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

  console.log("🎨 useImageGeneration state:", {
    prompt,
    selectedItem,
    selectedRatio,
    previewOpen,
    isGenerating,
    hasGeneratedImageUrl: !!generatedImageUrl,
    isSignedIn,
    canGenerateImage
  });

  // Handle generate button click
  const handleGenerate = async () => {
    console.log("🎯 handleGenerate called");
    
    if (!isSignedIn) {
      console.log("❌ User not signed in, opening auth dialog");
      setAuthDialogOpen(true);
      return;
    }

    if (!prompt.trim()) {
      console.log("❌ Empty prompt");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt",
      });
      return;
    }

    // Check subscription limits
    if (!canGenerateImage) {
      console.log("❌ Generation limit reached");
      // Prompt for upgrade
      toast({
        variant: "destructive",
        title: "Image Limit Reached",
        description: `You've reached your ${subscriptionStatus?.monthly_image_limit || 5} image limit for this month. Please upgrade your subscription to generate more images.`,
      });
      return;
    }

    try {
      console.log("🖼️ Starting image generation process...");
      
      // Upload reference image if provided
      let referenceImageUrl = null;
      if (referenceImage) {
        console.log("📎 Uploading reference image...");
        referenceImageUrl = await uploadReferenceImage(referenceImage);
        if (!referenceImageUrl) {
          console.log("❌ Reference image upload failed");
          return; // Upload failed
        }
        console.log("✅ Reference image uploaded:", referenceImageUrl);
      }

      const generateParams = {
        prompt,
        itemType: selectedItem,
        aspectRatio: selectedRatio,
        referenceImageUrl,
      };

      console.log("🚀 Calling createImage with params:", generateParams);

      // Call the generate image function with all parameters
      createImage(generateParams);
      
      // Open preview dialog when generation starts
      console.log("🎬 Opening preview dialog");
      setPreviewOpen(true);
      
      // Refresh subscription status after generating an image
      refetchStatus();
    } catch (error: any) {
      console.error("💥 Generation preparation error:", error);
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
