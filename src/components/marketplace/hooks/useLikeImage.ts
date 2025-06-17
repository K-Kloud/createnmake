
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LikeMutationParams } from "@/types/gallery";

export const useLikeImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, hasLiked, userId }: LikeMutationParams) => {
      try {
        // Use the new atomic function instead of manual operations
        const { data, error } = await supabase.rpc('atomic_like_image', {
          p_image_id: imageId,
          p_user_id: userId
        });

        if (error) throw error;

        return data; // Returns { action, new_count, has_liked }
      } catch (error: any) {
        console.error('Like mutation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🔴 Like operation successful:', data);
      // Invalidate queries to refresh from server state
      queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
    },
    onError: (error) => {
      console.error('Like mutation failed:', error);
      // Invalidate queries to refresh from server state
      queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
    }
  });
};
