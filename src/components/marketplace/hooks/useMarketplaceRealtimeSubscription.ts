
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMarketplaceRealtimeSubscription = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    console.log("🔴 Setting up real-time subscription for generated_images");
    
    const channel = supabase
      .channel('marketplace-images-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_images',
          filter: 'is_public=eq.true'
        },
        (payload) => {
          console.log('🔴 Real-time update received:', payload);
          // Only invalidate if likes count changed (reduces unnecessary refreshes)
          if (payload.new.likes !== payload.old?.likes) {
            queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'image_likes'
        },
        (payload) => {
          console.log('🔴 Like added:', payload);
          queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'image_likes'
        },
        (payload) => {
          console.log('🔴 Like removed:', payload);
          queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
        }
      )
      .subscribe();

    return () => {
      console.log("🔴 Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
