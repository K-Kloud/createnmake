import { supabase } from '@/integrations/supabase/client';

export interface GenerateImageParams {
  prompt: string;
  width?: number;
  height?: number;
  referenceImage?: string;
}

export const generateImage = async (params: GenerateImageParams) => {
  console.log('Calling generate-image function with params:', params);
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        prompt: params.prompt,
        width: params.width || 1024,
        height: params.height || 1024,
        referenceImage: params.referenceImage,
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to generate image');
    }

    if (!data) {
      console.error('No data received from function');
      throw new Error('No response data received');
    }

    console.log('Function response:', data);

    if (!data.url) {
      console.error('Invalid response structure:', data);
      throw new Error('No image URL in response');
    }

    return data;
  } catch (error: any) {
    console.error('Generation error:', error);
    throw error;
  }
};