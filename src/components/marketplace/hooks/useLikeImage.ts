import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { recordMetric } from "./useMarketplaceMetrics";
import { LikeMutationParams } from "@/types/gallery";

export const useLikeImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, hasLiked, userId }: LikeMutationParams) => {
      try {
        if (hasLiked) {
          const { error } = await supabase
            .from('image_likes')
            .delete()
            .eq('image_id', imageId)
            .eq('user_id', userId);
          if (error) throw error;

          await recordMetric(imageId, 'like', -1);
        } else {
          const { data: existingLikes, error: checkError } = await supabase
            .from('image_likes')
            .select('*')
            .eq('image_id', imageId)
            .eq('user_id', userId);

          if (checkError) throw checkError;

          if (!existingLikes || existingLikes.length === 0) {
            const { error: insertError } = await supabase
              .from('image_likes')
              .insert({ image_id: imageId, user_id: userId });
            if (insertError) throw insertError;

            await recordMetric(imageId, 'like', 1);
          }
        }
      } catch (error: any) {
        console.error('Like mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
    }
  });
};