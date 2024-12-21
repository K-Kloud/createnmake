import { useMutation } from "@tanstack/react-query";
import { recordMetric } from "./useMarketplaceMetrics";
import { supabase } from "@/integrations/supabase/client";

export const useViewImage = () => {
  return useMutation({
    mutationFn: async (imageId: number) => {
      await recordMetric(imageId, 'view', 1);
      const { error } = await supabase
        .rpc('increment_views', { image_id: imageId });
      if (error) throw error;
    }
  });
};