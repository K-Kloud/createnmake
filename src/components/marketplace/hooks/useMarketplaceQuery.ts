
import { useInfiniteQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { useMarketplaceRealtimeSubscription } from "./useMarketplaceRealtimeSubscription";
import { fetchMarketplaceImages, ITEMS_PER_PAGE } from "./useMarketplaceImageFetcher";
import { processMarketplaceImages } from "./useMarketplaceImageProcessor";

export const useMarketplaceQuery = (session: Session | null) => {
  const { toast } = useToast();
  
  // Set up real-time subscription for likes
  useMarketplaceRealtimeSubscription();
  
  return useInfiniteQuery({
    queryKey: ['marketplace-images'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const images = await fetchMarketplaceImages(pageParam);
        
        if (!images || images.length === 0) {
          return [];
        }

        return await processMarketplaceImages(images, session);

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
    staleTime: 1000 * 60, // Increased to 1 minute since we have real-time updates
    retry: (failureCount, error) => {
      console.error(`🔄 Query retry attempt ${failureCount}:`, error);
      return failureCount < 2; // Retry up to 2 times
    },
  });
};
