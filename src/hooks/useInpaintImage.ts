
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface InpaintImageParams {
  imageUrl: string;
  maskDataUrl: string;
  editPrompt: string;
  originalImageId: number;
}

interface InpaintImageResult {
  success: boolean;
  imageUrl: string;
  imageId: number;
  version: number;
}

const inpaintImage = async (params: InpaintImageParams): Promise<InpaintImageResult> => {
  console.log("🎨 Starting inpainting process:", params);

  const { data, error } = await supabase.functions.invoke("inpaint-image", {
    body: params,
  });

  console.log("📡 Inpainting response:", { data, error });

  if (error) {
    console.error("❌ Inpainting API error:", error);
    throw new Error(error.message || "Failed to edit image");
  }

  if (!data || !data.success) {
    console.error("❌ Inpainting failed:", data);
    throw new Error(data?.error || "Failed to edit image");
  }

  console.log("✅ Inpainting successful:", data);
  return data;
};

export const useInpaintImage = (
  options?: UseMutationOptions<InpaintImageResult, Error, InpaintImageParams>
) => {
  const { session } = useAuth();

  return useMutation<InpaintImageResult, Error, InpaintImageParams>({
    mutationFn: async (params) => {
      console.log("🎯 useInpaintImage mutation called with params:", params);
      
      if (!session?.user) {
        console.error("❌ User not authenticated");
        throw new Error("You need to be logged in to edit images");
      }
      
      console.log("👤 User authenticated:", session.user.id);
      
      return await inpaintImage(params);
    },
    ...options,
  });
};
