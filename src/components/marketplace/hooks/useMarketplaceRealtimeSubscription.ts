
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMarketplaceRealtimeSubscription = () => {
  const queryClient = useQueryClient();
  const invalidationTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    console.log("🔴 Setting up real-time subscription for generated_images");
    
    // Debounced invalidation to prevent rapid successive updates
    const debouncedInvalidation = () => {
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
      }
      
      invalidationTimeoutRef.current = setTimeout(() => {
        console.log('🔴 Debounced real-time invalidation triggered');
        queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
      }, 100); // 100ms debounce for faster real-time updates
    };
    
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
          console.log('🔴 Real-time generated_images update:', payload);
          // Only invalidate if likes count changed
          if (payload.new.likes !== payload.old?.likes) {
            debouncedInvalidation();
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
          console.log('🔴 Real-time like added:', payload);
          debouncedInvalidation();
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
          console.log('🔴 Real-time like removed:', payload);
          debouncedInvalidation();
        }
      )
      .subscribe();

    return () => {
      console.log("🔴 Cleaning up real-time subscription");
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
