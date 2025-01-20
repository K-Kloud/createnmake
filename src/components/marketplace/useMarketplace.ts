import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLikeImage } from "./hooks/useLikeImage";
import { useViewImage } from "./hooks/useViewImage";
import { useCommentImage } from "./hooks/useCommentImage";
import { formatDistanceToNow } from "date-fns";

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
        console.log('Fetching marketplace images...');
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
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching marketplace images:', error);
          throw error;
        }

        console.log('Raw images data:', images);

        if (!images) {
          console.log('No images found');
          return [];
        }

        const imagesWithMetrics = await Promise.all(
          images.map(async (image) => {
            try {
              // Call the RPC function directly
              const { data: metrics, error: metricsError } = await supabase
                .rpc('get_image_metrics', { p_image_id: image.id });

              if (metricsError) {
                console.error('Error fetching metrics for image', image.id, ':', metricsError);
                // Return default metrics if there's an error
                return {
                  ...image,
                  hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
                  comments: image.comments?.map(comment => ({
                    id: comment.id,
                    text: comment.text,
                    createdAt: new Date(comment.created_at),
                    user: {
                      id: comment.user_id,
                      name: comment.profiles?.username || 'Anonymous',
                      avatar: comment.profiles?.avatar_url || 'https://github.com/shadcn.png'
                    },
                    replies: comment.comment_replies?.map(reply => ({
                      id: reply.id,
                      text: reply.text,
                      createdAt: new Date(reply.created_at),
                      user: {
                        id: reply.user_id,
                        name: reply.profiles?.username || 'Anonymous',
                        avatar: reply.profiles?.avatar_url || 'https://github.com/shadcn.png'
                      }
                    })) || []
                  })) || [],
                  metrics: {
                    like: image.likes || 0,
                    comment: (image.comments || []).length,
                    view: image.views || 0
                  },
                  timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true })
                };
              }

              // Transform metrics array into an object
              const metricsMap = (metrics || []).reduce((acc, metric) => {
                acc[metric.metric_type] = metric.total_value;
                return acc;
              }, {});

              return {
                ...image,
                hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
                comments: image.comments?.map(comment => ({
                  id: comment.id,
                  text: comment.text,
                  createdAt: new Date(comment.created_at),
                  user: {
                    id: comment.user_id,
                    name: comment.profiles?.username || 'Anonymous',
                    avatar: comment.profiles?.avatar_url || 'https://github.com/shadcn.png'
                  },
                  replies: comment.comment_replies?.map(reply => ({
                    id: reply.id,
                    text: reply.text,
                    createdAt: new Date(reply.created_at),
                    user: {
                      id: reply.user_id,
                      name: reply.profiles?.username || 'Anonymous',
                      avatar: reply.profiles?.avatar_url || 'https://github.com/shadcn.png'
                    }
                  })) || []
                })) || [],
                metrics: metricsMap,
                timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true })
              };
            } catch (error) {
              console.error('Error processing image metrics:', error);
              return image;
            }
          })
        );

        console.log('Processed images with metrics:', imagesWithMetrics);
        return imagesWithMetrics;
      } catch (error) {
        console.error('Error in marketplace query:', error);
        toast({
          title: "Error Loading Images",
          description: "There was a problem loading the marketplace images. Please try refreshing the page.",
          variant: "destructive",
        });
        return [];
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
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