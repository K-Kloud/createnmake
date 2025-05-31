
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
        console.log(`🔍 Fetching marketplace images - page ${pageParam}`);
        const from = pageParam * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // Get images with profile relationships
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

        if (error) {
          console.error("❌ Error fetching images:", error);
          throw error;
        }

        if (!images || images.length === 0) {
          console.log("📭 No images found for this page");
          return [];
        }

        console.log(`✅ Found ${images.length} images`);

        // Process images in parallel for better performance
        const processedImages = await Promise.allSettled(
          images.map(async (image) => {
            try {
              // Validate image URL
              if (!image.image_url) {
                console.warn(`⚠️ Image ${image.id} has no URL`);
                return null;
              }

              // Log image URL for debugging
              console.log(`🖼️ Processing image ${image.id}:`, image.image_url);

              // Get comments with replies
              const { data: comments } = await supabase
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

              // Get replies for comments
              const commentsWithReplies = await Promise.all(
                (comments || []).map(async (comment) => {
                  const { data: replies } = await supabase
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

                  return { ...comment, comment_replies: replies || [] };
                })
              );

              // Get metrics
              const { data: metrics } = await supabase
                .rpc('get_image_metrics', { p_image_id: image.id });

              const metricsMap = (metrics || []).reduce((acc, metric) => {
                acc[metric.metric_type] = metric.total_value;
                return acc;
              }, {});

              const imageWithComments = { ...image, comments: commentsWithReplies };
              
              return transformImageWithMetrics(imageWithComments, session, metricsMap);
            } catch (error) {
              console.error(`❌ Error processing image ${image.id}:`, error);
              return transformImageWithDefaultMetrics(image, session);
            }
          })
        );

        // Filter out failed transformations and null values
        const validImages = processedImages
          .filter((result): result is PromiseFulfilledResult<any> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);

        console.log(`✅ Successfully processed ${validImages.length} images`);
        return validImages;

      } catch (error) {
        console.error('💥 Error in marketplace query:', error);
        toast({
          title: "Error Loading Images",
          description: "There was a problem loading the marketplace images. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: (failureCount, error) => {
      console.error(`🔄 Query retry attempt ${failureCount}:`, error);
      return failureCount < 2; // Retry up to 2 times
    },
  });
};
