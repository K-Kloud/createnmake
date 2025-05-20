
import { useCreateImage } from "@/services/imageGeneration";
import { useToast } from "@/components/ui/use-toast";

export const useImageGenerationAPI = () => {
  const { toast } = useToast();

  // Create image mutation
  const { 
    mutate: createImage, 
    isPending: isGenerating, 
    data: generatedImageUrl 
  } = useCreateImage({
    onSuccess: () => {
      // Success will be handled by parent component
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate image",
      });
    },
  });

  return {
    createImage,
    isGenerating,
    generatedImageUrl
  };
};
