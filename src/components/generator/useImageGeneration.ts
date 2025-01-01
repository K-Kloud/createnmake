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
      const { data } = await supabase.auth.getSession();
      return data.session;
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
      // Convert reference image to base64 if it exists
      let referenceImageBase64: string | undefined;
      if (referenceImage) {
        const reader = new FileReader();
        referenceImageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(referenceImage);
        });
      }

      // Create a record in the database
      const { data: dbRecord, error: dbError } = await supabase
        .from('generated_images')
        .insert({
          user_id: session.user.id,
          prompt: `${selectedItem}: ${prompt}`,
          item_type: selectedItem,
          aspect_ratio: selectedRatio,
          status: 'pending',
          is_public: true,
          title: prompt.slice(0, 100),
          reference_image_url: referenceImageBase64
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Generate the image
      const result = await generateImage({
        prompt: `${selectedItem}: ${prompt}`,
        width: 1024,
        height: 1024,
        referenceImage: referenceImageBase64
      });
      
      setGeneratedImageUrl(result.url);
      
      // Update the record with the generated image URL
      const { error: updateError } = await supabase
        .from('generated_images')
        .update({ 
          image_url: result.url,
          status: 'completed'
        })
        .eq('id', dbRecord.id);

      if (updateError) throw updateError;
      
      toast({
        title: "Image Generated",
        description: "Your image has been generated successfully",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });

      // Update status to failed if we have a database record
      if (error.id) {
        await supabase
          .from('generated_images')
          .update({ status: 'failed' })
          .eq('id', error.id);
      }
    } finally {
      setIsGenerating(false);
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
    handleGenerate
  };
};