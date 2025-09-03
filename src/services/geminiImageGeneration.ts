import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GeminiImageGenerationParams {
  prompt: string;
  itemType: string;
  aspectRatio: string;
  referenceImageUrl?: string;
}

export interface GeminiImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  imageId?: number;
  error?: string;
  suggestions?: string[];
  provider?: string;
  enhancedPrompt?: string;
}

const generateImageWithGemini = async (
  params: GeminiImageGenerationParams,
  userId: string
): Promise<GeminiImageGenerationResult> => {
  console.log("🎨 Starting Gemini image generation:", params);

  try {
    const { data, error } = await supabase.functions.invoke("generate-image-gemini", {
      body: params,
    });

    console.log("📡 Gemini API response:", { data, error });

    if (error) {
      console.error("❌ Gemini API error:", error);
      throw new Error(error.message || "Failed to generate image with Gemini");
    }

    if (!data || !data.success) {
      console.error("❌ Gemini generation failed:", data);
      throw new Error(data?.error || "Failed to generate image with Gemini");
    }

    console.log("✅ Gemini image generation successful:", data);
    return data;
  } catch (error) {
    console.error("💥 Gemini generation error:", error);
    
    // Enhanced error handling with suggestions
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const suggestions = [];
    
    if (errorMessage.includes('API key')) {
      suggestions.push('Verify your Google AI API key is correctly configured');
    }
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      suggestions.push('Check your Google AI API usage limits and billing');
      suggestions.push('Try again later or upgrade your Google AI plan');
    }
    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      suggestions.push('Try rephrasing your prompt to avoid content policy issues');
      suggestions.push('Use more general, family-friendly descriptions');
    }
    if (errorMessage.includes('timeout')) {
      suggestions.push('The request timed out, please try again');
    }
    
    throw {
      message: errorMessage,
      suggestions,
      provider: 'google-gemini'
    };
  }
};

export const useCreateImageWithGemini = (
  options?: UseMutationOptions<GeminiImageGenerationResult, Error, GeminiImageGenerationParams>
) => {
  const { session } = useAuth();

  return useMutation<GeminiImageGenerationResult, Error, GeminiImageGenerationParams>({
    mutationFn: async (params) => {
      console.log("🎯 useCreateImageWithGemini mutation called with params:", params);
      
      if (!session?.user) {
        console.error("❌ User not authenticated");
        throw new Error("You need to be logged in to generate images");
      }
      
      console.log("👤 User authenticated:", session.user.id);
      
      return await generateImageWithGemini(params, session.user.id);
    },
    ...options,
  });
};