import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { recordMetric } from "./useMarketplaceMetrics";
import { CommentMutationParams, ReplyMutationParams } from "@/types/gallery";

export const useCommentImage = () => {
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async ({ imageId, text, userId }: CommentMutationParams) => {
      const { error } = await supabase
        .from('comments')
        .insert({ image_id: imageId, text, user_id: userId });
      if (error) throw error;

      await recordMetric(imageId, 'comment', 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ commentId, text, userId }: ReplyMutationParams) => {
      const { error } = await supabase
        .from('comment_replies')
        .insert({ comment_id: commentId, text, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
    }
  });

  return { commentMutation, replyMutation };
};