import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Types for xAI image generation
interface XAIImageGenerationParams {
  prompt: string;
  itemType: string;
  aspectRatio: string;
  referenceImageUrl?: string;
}

interface XAIImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  imageId?: number;
  error?: string;
  suggestions?: string[];
}

// Core function to generate images with xAI
async function generateImageWithXAI(
  params: XAIImageGenerationParams,
  userId: string
): Promise<XAIImageGenerationResult> {
  try {
    console.log('🎨 Generating image with xAI Grok...', params);

    const { data, error } = await supabase.functions.invoke('generate-image-xai', {
      body: params,
    });

    if (error) {
      console.error('❌ xAI function error:', error);
      throw new Error(error.message || 'Failed to generate image with xAI');
    }

    if (!data) {
      throw new Error('No data returned from xAI function');
    }

    if (data.error) {
      return {
        success: false,
        error: data.error,
        suggestions: data.suggestions || [
          "Try using more descriptive terms",
          "Avoid potentially sensitive content",
          "Focus on fashion and clothing elements"
        ]
      };
    }

    console.log('✅ xAI image generation successful');
    return {
      success: true,
      imageUrl: data.url,
      imageId: data.imageId,
    };

  } catch (error: any) {
    console.error('💥 xAI generation error:', error);
    
    // Enhanced error handling with suggestions
    const suggestions = [
      "Try rephrasing your prompt with more descriptive terms",
      "Ensure your prompt focuses on clothing and fashion elements",
      "Avoid potentially sensitive or blocked content",
      "Try a simpler, more direct description"
    ];

    return {
      success: false,
      error: error.message || 'Failed to generate image with xAI',
      suggestions
    };
  }
}

// React Query hook for xAI image generation
export const useCreateImageWithXAI = (
  options?: UseMutationOptions<XAIImageGenerationResult, Error, XAIImageGenerationParams>
) => {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (params: XAIImageGenerationParams) => {
      if (!session?.user?.id) {
        throw new Error('Authentication required');
      }
      
      return generateImageWithXAI(params, session.user.id);
    },
    ...options,
  });
};