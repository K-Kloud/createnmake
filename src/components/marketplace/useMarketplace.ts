import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLikeImage } from "./hooks/useLikeImage";
import { useViewImage } from "./hooks/useViewImage";
import { useCommentImage } from "./hooks/useCommentImage";

export const useMarketplace = () => {
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const likeMutation = useLikeImage();
  const viewMutation = useViewImage();
  const { commentMutation, replyMutation } = useCommentImage();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: images, isLoading } = useQuery({
    queryKey: ['marketplace-images'],
    queryFn: async () => {
      try {
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

        const imagesWithMetrics = await Promise.all(
          images.map(async (image) => {
            const { data: metrics, error: metricsError } = await supabase
              .rpc('get_image_metrics', { p_image_id: image.id });

            if (metricsError) {
              console.error('Error fetching metrics:', metricsError);
              return image;
            }

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
      } catch (error) {
        console.error('Error fetching marketplace images:', error);
        toast({
          title: "Error",
          description: "Failed to load marketplace images",
          variant: "destructive",
        });
        return [];
      }
    },
    retry: 1,
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