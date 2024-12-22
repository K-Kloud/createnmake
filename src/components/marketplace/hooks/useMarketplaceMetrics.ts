import { supabase } from "@/integrations/supabase/client";

export const recordMetric = async (imageId: number, metricType: string, value: number = 1) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('marketplace_metrics')
      .insert({
        image_id: imageId,
        metric_type: metricType,
        metric_value: value
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error recording metric:', error);
    throw error;
  }
};