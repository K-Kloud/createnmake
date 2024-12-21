import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { LikeMutationParams, CommentMutationParams, ReplyMutationParams } from "@/types/gallery";

export const useMarketplace = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const { data: images, isLoading } = useQuery({
    queryKey: ['marketplace-images'],
    queryFn: async () => {
      // First get the images with their basic info
      const { data: images, error } = await supabase
        .from('generated_images')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          ),
          image_likes(user_id),
          comments(
            id,
            text,
            created_at,
            user_id,
            profiles(username, avatar_url),
            comment_replies(
              id,
              text,
              created_at,
              user_id,
              profiles(username, avatar_url)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get metrics for each image
      const imagesWithMetrics = await Promise.all(
        images.map(async (image) => {
          const { data: metrics, error: metricsError } = await supabase
            .rpc('get_image_metrics', { p_image_id: image.id });

          if (metricsError) console.error('Error fetching metrics:', metricsError);

          const metricsMap = (metrics || []).reduce((acc, metric) => {
            acc[metric.metric_type] = metric.total_value;
            return acc;
          }, {});

          return {
            ...image,
            hasLiked: image.image_likes.some(like => like.user_id === session?.user?.id),
            comments: image.comments.map(comment => ({
              id: comment.id,
              text: comment.text,
              createdAt: new Date(comment.created_at),
              user: {
                id: comment.user_id,
                name: comment.profiles.username,
                avatar: comment.profiles.avatar_url
              },
              replies: comment.comment_replies.map(reply => ({
                id: reply.id,
                text: reply.text,
                createdAt: new Date(reply.created_at),
                user: {
                  id: reply.user_id,
                  name: reply.profiles.username,
                  avatar: reply.profiles.avatar_url
                }
              }))
            })),
            metrics: metricsMap
          };
        })
      );

      return imagesWithMetrics;
    }
  });

  const recordMetric = async (imageId: number, metricType: string, value: number = 1) => {
    const { error } = await supabase
      .from('marketplace_metrics')
      .insert({
        image_id: imageId,
        metric_type: metricType,
        metric_value: value
      });

    if (error) {
      console.error('Error recording metric:', error);
      throw error;
    }
  };

  const likeMutation = useMutation({
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
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const viewMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await recordMetric(imageId, 'view', 1);
      const { error } = await supabase
        .rpc('increment_views', { image_id: imageId });
      if (error) throw error;
    }
  });

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
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Reply posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    session,
    images,
    isLoading,
    likeMutation,
    viewMutation,
    commentMutation,
    replyMutation,
    toast
  };
};