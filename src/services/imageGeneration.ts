
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ImageGenerationParams {
  prompt: string;
  itemType: string;
  aspectRatio: string;
  referenceImageUrl: string | null;
}

interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  suggestions?: string[];
}

const generateImage = async (params: {
  prompt: string;
  itemType: string;
  aspectRatio: string;
  referenceImageUrl: string | null;
  userId: string;
}): Promise<ImageGenerationResult> => {
  try {
    // Update to use the Supabase edge function
    const { data, error } = await supabase.functions.invoke("generate-image", {
      body: {
        prompt: params.prompt,
        itemType: params.itemType,
        aspectRatio: params.aspectRatio,
        referenceImageUrl: params.referenceImageUrl,
      },
    });

    if (error) {
      console.error(`Image generation API error:`, error);
      
      // Handle different types of errors
      if (error.message?.includes('safety') || error.message?.includes('policy')) {
        return { 
          success: false, 
          error: "Your prompt was flagged by our content policy. Please try rephrasing with more appropriate terms.",
          suggestions: [
            "Focus on clothing design and fashion elements",
            "Use descriptive but appropriate language",
            "Avoid potentially sensitive content"
          ]
        };
      }
      
      return { 
        success: false, 
        error: error.message || `API error`,
        suggestions: error.suggestions || []
      };
    }

    if (!data || !data.url) {
      console.error("No output URL in response", data);
      return { 
        success: false, 
        error: "No image URL returned from the API. Please try again.",
        suggestions: [
          "Check your internet connection",
          "Try a different prompt",
          "Wait a moment and try again"
        ]
      };
    }

    // Save the generated image details to Supabase
    const { error: dbError } = await supabase
      .from("generated_images")
      .insert([
        {
          user_id: params.userId,
          prompt: params.prompt,
          image_url: data.url,
          item_type: params.itemType,
          aspect_ratio: params.aspectRatio,
          reference_image_url: params.referenceImageUrl,
          status: 'completed'
        },
      ]);

    if (dbError) {
      console.error("Database error when saving image:", dbError);
      // We still return success even if DB save fails, as the image was generated
      return { success: true, imageUrl: data.url };
    }

    return { success: true, imageUrl: data.url };
  } catch (error: any) {
    console.error("Image generation error:", error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return { 
        success: false, 
        error: "Network error. Please check your connection and try again.",
        suggestions: [
          "Check your internet connection",
          "Try refreshing the page",
          "Wait a moment and try again"
        ]
      };
    }
    
    return { 
      success: false, 
      error: error.message || "Unknown error occurred",
      suggestions: [
        "Try rephrasing your prompt",
        "Make sure your prompt is clear and appropriate",
        "Contact support if the issue persists"
      ]
    };
  }
};

export const useCreateImage = (options?: UseMutationOptions<string, Error, ImageGenerationParams>) => {
  const { session } = useAuth();

  return useMutation<string, Error, ImageGenerationParams>({
    mutationFn: async (params) => {
      if (!session?.user) {
        throw new Error("You need to be logged in to generate images");
      }
      
      // Generate the image using the service function
      const result = await generateImage({
        prompt: params.prompt,
        itemType: params.itemType,
        aspectRatio: params.aspectRatio,
        referenceImageUrl: params.referenceImageUrl,
        userId: session.user.id
      });

      if (!result.success || !result.imageUrl) {
        const error = new Error(result.error || "Failed to generate image");
        // Attach suggestions to the error for better user feedback
        (error as any).suggestions = result.suggestions;
        throw error;
      }

      return result.imageUrl;
    },
    ...options,
  });
};
