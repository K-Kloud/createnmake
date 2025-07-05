import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreatorStats {
  followers_count: number;
  following_count: number;
  designs_count: number;
  total_likes: number;
  total_views: number;
}

export const useCreatorStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['creator-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .rpc('get_user_stats', { user_uuid: userId });

      if (error) throw error;
      return data as unknown as CreatorStats;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};