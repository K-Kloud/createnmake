import { supabase } from '@/integrations/supabase/client';

export interface GenerateImageParams {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
}

export const generateImage = async (params: GenerateImageParams) => {
  console.log('Calling generate-image function with params:', params);
  
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: params
  });

  if (error) {
    console.error('Generation error:', error);
    throw error;
  }

  console.log('Generation result:', data);
  return data;
};