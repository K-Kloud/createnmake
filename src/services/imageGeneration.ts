import { supabase } from '@/lib/supabaseClient';

export interface GenerateImageParams {
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
}

export const generateImage = async (params: GenerateImageParams) => {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: params
  });

  if (error) throw error;
  return data;
};