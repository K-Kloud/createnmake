import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface HuggingFaceImageGenerationParams {
  prompt: string;
  itemType: string;
  aspectRatio: string;
  referenceImageUrl?: string;
}

export interface HuggingFaceImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  imageId?: number;
  error?: string;
  suggestions?: string[];
  provider?: string;
  enhancedPrompt?: string;
}

const generateImageWithHuggingFace = async (
  params: HuggingFaceImageGenerationParams,
  userId: string
): Promise<HuggingFaceImageGenerationResult> => {
  console.log("🎨 Starting Hugging Face image generation:", params);

  try {
    const { data, error } = await supabase.functions.invoke("generate-image-huggingface", {
      body: params,
    });

    console.log("📡 Hugging Face API response:", { data, error });

    if (error) {
      console.error("❌ Hugging Face API error:", error);
      throw new Error(error.message || "Failed to generate image with Hugging Face");
    }

    if (!data || !data.success) {
      console.error("❌ Hugging Face generation failed:", data);
      throw new Error(data?.error || "Failed to generate image with Hugging Face");
    }

    console.log("✅ Hugging Face image generation successful:", data);
    return data;
  } catch (error) {
    console.error("💥 Hugging Face generation error:", error);
    
    // Enhanced error handling with suggestions
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const suggestions = [];
    
    if (errorMessage.includes('API key') || errorMessage.includes('token')) {
      suggestions.push('Verify your Hugging Face API token is correctly configured');
    }
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      suggestions.push('Check your Hugging Face API usage limits');
      suggestions.push('Try again later or upgrade your Hugging Face plan');
    }
    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      suggestions.push('Try rephrasing your prompt to avoid content policy issues');
      suggestions.push('Use more general, family-friendly descriptions');
    }
    if (errorMessage.includes('timeout')) {
      suggestions.push('The request timed out, please try again');
    }
    if (errorMessage.includes('model')) {
      suggestions.push('The model is currently loading, please wait and try again');
    }
    
    throw {
      message: errorMessage,
      suggestions,
      provider: 'huggingface'
    };
  }
};

export const useCreateImageWithHuggingFace = (
  options?: UseMutationOptions<HuggingFaceImageGenerationResult, Error, HuggingFaceImageGenerationParams>
) => {
  const { session } = useAuth();

  return useMutation<HuggingFaceImageGenerationResult, Error, HuggingFaceImageGenerationParams>({
    mutationFn: async (params) => {
      console.log("🎯 useCreateImageWithHuggingFace mutation called with params:", params);
      
      if (!session?.user) {
        console.error("❌ User not authenticated");
        throw new Error("You need to be logged in to generate images");
      }
      
      console.log("👤 User authenticated:", session.user.id);
      
      return await generateImageWithHuggingFace(params, session.user.id);
    },
    ...options,
  });
};