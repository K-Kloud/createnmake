
import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLikeImage } from "./hooks/useLikeImage";
import { useViewImage } from "./hooks/useViewImage";
import { useCommentImage } from "./hooks/useCommentImage";
import { formatDistanceToNow } from "date-fns";

const ITEMS_PER_PAGE = 9;

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

  const {
    data: images,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['marketplace-images'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const from = pageParam * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data: images, error } = await supabase
          .from('generated_images')
          .select(`
            *,
            profiles!generated_images_user_id_fkey (
              username,
              avatar_url
            ),
            image_likes(user_id),
            comments(
              id,
              text,
              created_at,
              user_id,
              profiles!generated_images_user_id_fkey(username, avatar_url),
              comment_replies(
                id,
                text,
                created_at,
                user_id,
                profiles!generated_images_user_id_fkey(username, avatar_url)
              )
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (!images) return [];

        const imagesWithMetrics = await Promise.all(
          images.map(async (image) => {
            try {
              const { data: metrics, error: metricsError } = await supabase
                .rpc('get_image_metrics', { p_image_id: image.id });

              if (metricsError) {
                console.error('Error fetching metrics for image', image.id, ':', metricsError);
                return transformImageWithDefaultMetrics(image, session);
              }

              const metricsMap = (metrics || []).reduce((acc, metric) => {
                acc[metric.metric_type] = metric.total_value;
                return acc;
              }, {});

              return transformImageWithMetrics(image, session, metricsMap);
            } catch (error) {
              console.error('Error processing image metrics:', error);
              return transformImageWithDefaultMetrics(image, session);
            }
          })
        );

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
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const transformImageWithDefaultMetrics = (image, session) => ({
    ...image,
    hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
    comments: transformComments(image.comments),
    metrics: {
      like: image.likes || 0,
      comment: (image.comments || []).length,
      view: image.views || 0
    },
    timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true }),
    price: image.price
  });

  const transformImageWithMetrics = (image, session, metricsMap) => ({
    ...image,
    hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
    comments: transformComments(image.comments),
    metrics: metricsMap,
    timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true }),
    price: image.price
  });

  const transformComments = (comments) => {
    return comments?.map(comment => ({
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
    })) || [];
  };

  return {
    session,
    images,
    isLoading,
    likeMutation,
    viewMutation,
    commentMutation,
    replyMutation,
    toast,
    fetchNextPage,
    hasNextPage,
  };
};
