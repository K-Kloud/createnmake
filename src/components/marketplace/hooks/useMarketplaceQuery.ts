
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { transformImageWithMetrics, transformImageWithDefaultMetrics } from "./useMarketplaceTransformers";

const ITEMS_PER_PAGE = 9;

export const useMarketplaceQuery = (session: Session | null) => {
  const { toast } = useToast();
  
  return useInfiniteQuery({
    queryKey: ['marketplace-images'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const from = pageParam * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // First, get the images with proper profile relationships
        const { data: images, error } = await supabase
          .from('generated_images')
          .select(`
            *,
            profiles!generated_images_user_id_fkey (
              username,
              avatar_url
            ),
            image_likes(user_id)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (!images) return [];

        // Now, get the comments separately for each image
        const imagesWithComments = await Promise.all(
          images.map(async (image) => {
            // Get comments for this image with proper profile joins
            const { data: comments, error: commentsError } = await supabase
              .from('comments')
              .select(`
                id,
                text,
                created_at,
                user_id,
                profiles:user_id (
                  id, 
                  username,
                  avatar_url
                )
              `)
              .eq('image_id', image.id);

            if (commentsError) {
              console.error('Error fetching comments for image', image.id, ':', commentsError);
              // Create a new object with the comments property
              return { ...image, comments: [] };
            } else {
              // Now get replies for each comment with proper profile joins
              const commentsWithReplies = await Promise.all(
                (comments || []).map(async (comment) => {
                  const { data: replies, error: repliesError } = await supabase
                    .from('comment_replies')
                    .select(`
                      id,
                      text,
                      created_at,
                      user_id,
                      profiles:user_id (
                        id,
                        username,
                        avatar_url
                      )
                    `)
                    .eq('comment_id', comment.id);

                  if (repliesError) {
                    console.error('Error fetching replies for comment', comment.id, ':', repliesError);
                    // Add comment_replies as a new property
                    return { ...comment, comment_replies: [] };
                  } else {
                    // Add comment_replies as a new property
                    return { ...comment, comment_replies: replies || [] };
                  }
                })
              );
              // Create a new object with the comments property
              return { ...image, comments: commentsWithReplies || [] };
            }
          })
        );

        const imagesWithMetrics = await Promise.all(
          imagesWithComments.map(async (image) => {
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
};
