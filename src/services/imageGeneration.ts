
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
}

const generateImage = async (params: {
  prompt: string;
  itemType: string;
  aspectRatio: string;
  referenceImageUrl: string | null;
  userId: string;
}): Promise<ImageGenerationResult> => {
  try {
    // Update to use the Supabase edge function instead of a local API endpoint
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
      return { success: false, error: error.message || `API error` };
    }

    if (!data || !data.url) {
      console.error("No output URL in response", data);
      return { success: false, error: "No image URL returned from the API" };
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
    return { success: false, error: error.message || "Unknown error occurred" };
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
        throw new Error(result.error || "Failed to generate image");
      }

      return result.imageUrl;
    },
    ...options,
  });
};
