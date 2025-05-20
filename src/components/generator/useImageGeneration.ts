
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateImage } from "@/services/imageGeneration";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useImageGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>();
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const { data } = await supabase.auth.getSession();
        return data.session;
      } catch (error) {
        console.error('Session fetch error:', error);
        return null;
      }
    },
  });

  const handleGenerate = async () => {
    if (!session?.user) {
      setAuthDialogOpen(true);
      return;
    }

    if (!selectedItem || !prompt) {
      toast({
        title: !selectedItem ? "Item Required" : "Prompt Required",
        description: !selectedItem 
          ? "Please select an item to generate"
          : "Please enter a description of what you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setPreviewOpen(true);
    setGeneratedImageUrl(undefined);

    try {
      let referenceImageBase64: string | undefined;
      if (referenceImage) {
        const reader = new FileReader();
        referenceImageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(referenceImage);
        });
      }

      // Get dimensions based on selected ratio
      const dimensions = getDimensionsForRatio(selectedRatio);

      // Generate the image and get back the Supabase storage URL
      const combinedPrompt = `${selectedItem}: ${prompt}`;
      console.log('Sending generation request with prompt:', combinedPrompt);
      
      const result = await generateImage({
        prompt: combinedPrompt,
        width: dimensions.width,
        height: dimensions.height,
        referenceImage: referenceImageBase64
      });
      
      if (!result?.url) {
        throw new Error('No image URL received from generation service');
      }

      console.log('Received image URL:', result.url);

      // Create the database record with the permanent URL
      const { data: dbRecord, error: dbError } = await supabase
        .from('generated_images')
        .insert({
          user_id: session.user.id,
          prompt: combinedPrompt,
          item_type: selectedItem,
          aspect_ratio: selectedRatio,
          status: 'completed',
          is_public: true,
          title: prompt.slice(0, 100),
          image_url: result.url,
          reference_image_url: referenceImageBase64
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database record creation fails
        // We don't want to block the UI if just the record creation fails
        toast({
          title: "Warning",
          description: "Image was generated but couldn't be saved to your history",
          variant: "default",
        });
      }

      setGeneratedImageUrl(result.url);
      
      toast({
        title: "Design Generated",
        description: "Your design has been generated successfully",
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to get width/height based on selected ratio
  const getDimensionsForRatio = (ratio: string) => {
    const ratioMap = {
      "square": { width: 1024, height: 1024 },
      "portrait": { width: 1024, height: 1280 },
      "landscape": { width: 1280, height: 1024 },
      "story": { width: 1024, height: 1792 },
      "youtube": { width: 1280, height: 720 },
      "facebook": { width: 1200, height: 630 },
      "twitter": { width: 1200, height: 675 },
      "linkedin": { width: 1200, height: 627 }
    };

    return ratioMap[ratio as keyof typeof ratioMap] || { width: 1024, height: 1024 };
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
    handleGenerate
  };
};
