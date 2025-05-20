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
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: params.prompt,
        itemType: params.itemType,
        aspectRatio: params.aspectRatio,
        referenceImageUrl: params.referenceImageUrl,
      }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      console.error(`Image generation failed: ${data.error}`);
      return { success: false, error: data.error };
    }

    // Save the generated image details to Supabase
    const { data: imageRecord, error: dbError } = await supabase
      .from("generated_images")
      .insert([
        {
          user_id: params.userId,
          prompt: params.prompt,
          image_url: data.output_url,
          item_type: params.itemType,
          aspect_ratio: params.aspectRatio,
          reference_image_url: params.referenceImageUrl,
          status: 'completed'
        },
      ])
      .select()

    if (dbError) {
      console.error("DB insert error:", dbError);
      return { success: false, error: "Failed to save image details" };
    }

    return { success: true, imageUrl: data.output_url };
  } catch (error: any) {
    console.error("Image generation error:", error);
    return { success: false, error: error.message };
  }
};

export const useCreateImage = (options?: UseMutationOptions<string, Error, ImageGenerationParams>) => {
  const { session } = useAuth();

  return useMutation<string, Error, ImageGenerationParams>({
    mutationFn: async (params) => {
      if (!session?.user) {
        throw new Error("You need to be logged in to generate images");
      }

      // Check if reference image bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const refImageBucket = buckets?.find(b => b.name === "reference-images");
      
      if (!refImageBucket) {
        await supabase.storage.createBucket("reference-images", {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        });
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
