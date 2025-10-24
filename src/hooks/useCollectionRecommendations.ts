import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RecommendedCollection {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  image_count: number;
  follower_count: number;
  category: string | null;
  tags: string[] | null;
  relevance_score: number;
}

export const useCollectionRecommendations = () => {
  const { user } = useAuth();

  // Get personalized recommendations based on user activity
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['collection-recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get collections user follows
      const { data: followedCollections } = await supabase
        .from('collection_followers')
        .select('collection_id')
        .eq('user_id', user.id);

      const followedIds = followedCollections?.map(f => f.collection_id) || [];

      // Get user's collection activity to understand preferences
      const { data: userActivity } = await supabase
        .from('collection_activity')
        .select(`
          collection_id,
          image_collections!inner(category, tags)
        `)
        .eq('user_id', user.id)
        .limit(20);

      // Extract preferred categories and tags
      const preferredCategories = new Set<string>();
      const preferredTags = new Set<string>();

      userActivity?.forEach((activity: any) => {
        if (activity.image_collections?.category) {
          preferredCategories.add(activity.image_collections.category);
        }
        if (activity.image_collections?.tags) {
          activity.image_collections.tags.forEach((tag: string) => preferredTags.add(tag));
        }
      });

      // Find similar collections based on preferences
      let query = supabase
        .from('image_collections')
        .select('*')
        .eq('is_public', true)
        .not('id', 'in', `(${followedIds.join(',') || '00000000-0000-0000-0000-000000000000'})`)
        .not('user_id', 'eq', user.id)
        .gte('follower_count', 1)
        .order('follower_count', { ascending: false })
        .limit(12);

      // Apply category filter if we have preferences
      if (preferredCategories.size > 0) {
        query = query.in('category', Array.from(preferredCategories));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate relevance scores
      const scored = (data || []).map((collection: any) => {
        let score = 0;

        // Score based on category match
        if (collection.category && preferredCategories.has(collection.category)) {
          score += 5;
        }

        // Score based on tag overlap
        if (collection.tags && Array.isArray(collection.tags)) {
          const tagOverlap = collection.tags.filter((tag: string) =>
            preferredTags.has(tag)
          ).length;
          score += tagOverlap * 3;
        }

        // Score based on popularity
        score += Math.log10(collection.follower_count + 1) * 2;
        score += Math.log10(collection.image_count + 1);

        return {
          ...collection,
          relevance_score: score,
        };
      });

      // Sort by relevance score
      return scored
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 6) as RecommendedCollection[];
    },
    enabled: !!user?.id,
  });

  // Get popular collections for non-authenticated users
  const { data: popularCollections = [], isLoading: isLoadingPopular } = useQuery({
    queryKey: ['popular-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('image_collections')
        .select('*')
        .eq('is_public', true)
        .order('follower_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      return (data || []).map(c => ({ ...c, relevance_score: 0 })) as RecommendedCollection[];
    },
    enabled: !user?.id,
  });

  return {
    recommendations: user?.id ? recommendations : popularCollections,
    isLoading: user?.id ? isLoading : isLoadingPopular,
  };
};
