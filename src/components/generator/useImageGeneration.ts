
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReferenceImageUpload } from "@/hooks/useReferenceImageUpload";
import { useImageGenerationAPI } from "@/hooks/useImageGenerationAPI";
import { useAuthDialog } from "@/hooks/useAuthDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { GenerationParams, GenerationState, GenerationError } from "@/types/generator";
import { log } from "@/lib/logger";

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

  log.debug('useImageGeneration state', 'ImageGeneration', {
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
    log.info('handleGenerate called', 'ImageGeneration');
    
    if (!isSignedIn) {
      log.warn('User not signed in, opening auth dialog', 'ImageGeneration');
      setAuthDialogOpen(true);
      return;
    }

    if (!prompt.trim()) {
      log.warn('Empty prompt provided', 'ImageGeneration');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt",
      });
      return;
    }

    // Check subscription limits
    if (!canGenerateImage) {
      log.warn('Generation limit reached', 'ImageGeneration', { 
        monthlyLimit: subscriptionStatus?.monthly_image_limit 
      });
      toast({
        variant: "destructive",
        title: "Image Limit Reached",
        description: `You've reached your ${subscriptionStatus?.monthly_image_limit || 5} image limit for this month. Please upgrade your subscription to generate more images.`,
      });
      return;
    }

    try {
      log.info('Starting image generation process', 'ImageGeneration');
      
      // Upload reference image if provided
      let referenceImageUrl: string | null = null;
      if (referenceImage) {
        log.info('Uploading reference image', 'ImageGeneration', { fileName: referenceImage.name });
        referenceImageUrl = await uploadReferenceImage(referenceImage);
        if (!referenceImageUrl) {
          log.error('Reference image upload failed', 'ImageGeneration');
          return; // Upload failed
        }
        log.info('Reference image uploaded successfully', 'ImageGeneration', { url: referenceImageUrl });
      }

      const generateParams = {
        prompt,
        itemType: selectedItem,
        aspectRatio: selectedRatio,
        referenceImageUrl: referenceImageUrl || null,
      };

      log.info('Calling createImage with params', 'ImageGeneration', generateParams);

      // Call the generate image function with all parameters
      createImage(generateParams);
      
      // Open preview dialog when generation starts
      log.debug('Opening preview dialog', 'ImageGeneration');
      setPreviewOpen(true);
      
      // Refresh subscription status after generating an image
      refetchStatus();
    } catch (error) {
      const generationError = error as GenerationError;
      log.error('Generation preparation error', 'ImageGeneration', { 
        error: generationError.message,
        code: generationError.code,
        details: generationError.details
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: generationError.message || "Failed to prepare for image generation",
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
