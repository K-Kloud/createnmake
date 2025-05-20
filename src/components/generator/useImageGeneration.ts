
import { useState } from "react";
import { useCreateImage } from "@/services/imageGeneration";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export const useImageGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("product");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const { 
    subscriptionStatus, 
    canGenerateImage, 
    remainingImages,
    refetchStatus
  } = useSubscription();

  // Create image mutation
  const { mutate: createImage, isPending: isGenerating, data: generatedImageUrl } = useCreateImage({
    onSuccess: () => {
      setPreviewOpen(true);
      // Refresh subscription status after generating an image
      refetchStatus();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate image",
      });
    },
  });

  // Handle generate button click
  const handleGenerate = async () => {
    if (!session?.user) {
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

    let referenceImageUrl = null;
    if (referenceImage) {
      // Upload reference image to storage if provided
      const { data, error } = await supabase.storage
        .from("reference-images")
        .upload(`${Date.now()}-${referenceImage.name}`, referenceImage);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to upload reference image",
        });
        return;
      }
      
      // Get public URL for the uploaded reference image
      const { data: publicUrl } = supabase.storage
        .from("reference-images")
        .getPublicUrl(data.path);
        
      referenceImageUrl = publicUrl.publicUrl;
    }

    // Call the generate image function with all parameters
    createImage({
      prompt,
      itemType: selectedItem,
      aspectRatio: selectedRatio,
      referenceImageUrl: referenceImageUrl,
    });
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
