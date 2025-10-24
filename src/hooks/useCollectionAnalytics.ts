import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CollectionStats {
  total_views: number;
  unique_viewers: number;
  total_followers: number;
  total_images: number;
  recent_activity: number;
  views_last_7_days: number;
  images_added_last_7_days: number;
}

interface TrendingCollection {
  collection_id: string;
  collection_name: string;
  cover_image_url: string | null;
  image_count: number;
  follower_count: number;
  view_count: number;
  trending_score: number;
}

interface ActivityItem {
  id: string;
  collection_id: string;
  user_id: string;
  activity_type: 'created' | 'updated' | 'image_added' | 'image_removed' | 'shared';
  activity_data: any;
  created_at: string;
  image_collections?: {
    name: string;
    cover_image_url: string | null;
  };
}

export const useCollectionAnalytics = (collectionId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch collection statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['collection-stats', collectionId],
    queryFn: async () => {
      if (!collectionId) return null;
      
      const { data, error } = await supabase.rpc('get_collection_stats', {
        p_collection_id: collectionId,
      });

      if (error) throw error;
      
      // Parse the JSON result
      const result = data as any;
      return {
        total_views: result.total_views || 0,
        unique_viewers: result.unique_viewers || 0,
        total_followers: result.total_followers || 0,
        total_images: result.total_images || 0,
        recent_activity: result.recent_activity || 0,
        views_last_7_days: result.views_last_7_days || 0,
        images_added_last_7_days: result.images_added_last_7_days || 0,
      } as CollectionStats;
    },
    enabled: !!collectionId,
  });

  // Fetch trending collections
  const { data: trendingCollections = [], isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending-collections'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_collections', {
        limit_count: 10,
      });

      if (error) throw error;
      return data as TrendingCollection[];
    },
  });

  // Fetch user activity
  const { data: userActivity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ['user-collection-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('collection_activity')
        .select(`
          *,
          image_collections (
            name,
            cover_image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ActivityItem[];
    },
    enabled: !!user?.id,
  });

  // Track collection view
  const trackViewMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase
        .from('collection_views')
        .insert({
          collection_id: collectionId,
          user_id: user?.id || null,
          session_id: sessionStorage.getItem('session_id') || crypto.randomUUID(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] });
    },
  });

  // Track share activity
  const trackShareMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('collection_activity')
        .insert({
          collection_id: collectionId,
          user_id: user.id,
          activity_type: 'shared',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-collection-activity'] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] });
    },
  });

  return {
    stats,
    trendingCollections,
    userActivity,
    isLoadingStats,
    isLoadingTrending,
    isLoadingActivity,
    trackView: trackViewMutation.mutate,
    trackShare: trackShareMutation.mutate,
  };
};
