
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
          // Remove like
          const { error } = await supabase
            .from('image_likes')
            .delete()
            .eq('image_id', imageId)
            .eq('user_id', userId);
          if (error) throw error;

          // Get current likes count and decrement by 1, ensuring it doesn't go below 0
          const { data: currentImage, error: fetchError } = await supabase
            .from('generated_images')
            .select('likes')
            .eq('id', imageId)
            .single();
          
          if (fetchError) throw fetchError;
          
          const newLikes = Math.max(0, (currentImage?.likes || 0) - 1);
          
          const { error: updateError } = await supabase
            .from('generated_images')
            .update({ likes: newLikes })
            .eq('id', imageId);
          if (updateError) throw updateError;

          // Record metric for analytics
          await recordMetric(imageId, 'like', -1);
        } else {
          // Check if like already exists
          const { data: existingLikes, error: checkError } = await supabase
            .from('image_likes')
            .select('*')
            .eq('image_id', imageId)
            .eq('user_id', userId);

          if (checkError) throw checkError;

          if (!existingLikes || existingLikes.length === 0) {
            // Add like
            const { error: insertError } = await supabase
              .from('image_likes')
              .insert({ image_id: imageId, user_id: userId });
            if (insertError) throw insertError;

            // Get current likes count and increment by 1
            const { data: currentImage, error: fetchError } = await supabase
              .from('generated_images')
              .select('likes')
              .eq('id', imageId)
              .single();
            
            if (fetchError) throw fetchError;
            
            const newLikes = (currentImage?.likes || 0) + 1;
            
            const { error: updateError } = await supabase
              .from('generated_images')
              .update({ likes: newLikes })
              .eq('id', imageId);
            if (updateError) throw updateError;

            // Record metric for analytics
            await recordMetric(imageId, 'like', 1);
          }
        }
      } catch (error: any) {
        console.error('Like mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the correct query key
      queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
    },
    onError: (error) => {
      console.error('Like mutation failed:', error);
      // Invalidate queries to refresh from server state
      queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
    }
  });
};
