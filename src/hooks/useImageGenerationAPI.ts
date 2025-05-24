
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
      toast({
        title: "Success!",
        description: "Your image has been generated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Image generation error:", error);
      
      // Show enhanced error message with suggestions
      const errorMessage = error.message || "Failed to generate image";
      const suggestions = error.suggestions || [];
      
      let description = errorMessage;
      if (suggestions.length > 0) {
        description += "\n\nSuggestions:\n• " + suggestions.join("\n• ");
      }
      
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: description,
        duration: 8000, // Show longer for detailed messages
      });
    },
  });

  return {
    createImage,
    isGenerating,
    generatedImageUrl
  };
};
