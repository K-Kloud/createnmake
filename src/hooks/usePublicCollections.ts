import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Collection } from './useCollections';

interface PublicCollection extends Collection {
  category?: string;
  tags?: string[];
  follower_count: number;
  is_following?: boolean;
}

export const usePublicCollections = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch public collections with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['public-collections', userId],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 12;
      const offset = pageParam * limit;

      let query = supabase
        .from('image_collections')
        .select(`
          *,
          collection_followers!left(user_id)
        `)
        .eq('is_public', true)
        .order('follower_count', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: collections, error } = await query;

      if (error) throw error;

      // Check if current user is following each collection
      const collectionsWithFollowing = collections.map((col: any) => ({
        ...col,
        is_following: userId
          ? col.collection_followers?.some((f: any) => f.user_id === userId)
          : false,
      }));

      return collectionsWithFollowing as PublicCollection[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  // Fetch featured collections (top by follower count)
  const { data: featuredCollections = [] } = useQuery({
    queryKey: ['featured-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('image_collections')
        .select('*')
        .eq('is_public', true)
        .order('follower_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as PublicCollection[];
    },
  });

  // Fetch single collection details
  const useCollectionDetail = (collectionId: string) => {
    return useQuery({
      queryKey: ['collection-detail', collectionId, userId],
      queryFn: async () => {
        const { data: collection, error } = await supabase
          .from('image_collections')
          .select(`
            *,
            collection_followers!left(user_id)
          `)
          .eq('id', collectionId)
          .single();

        if (error) throw error;

        // Check if following
        const is_following = userId
          ? collection.collection_followers?.some((f: any) => f.user_id === userId)
          : false;

        return { ...collection, is_following } as PublicCollection;
      },
      enabled: !!collectionId,
    });
  };

  // Follow collection
  const followMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!userId) throw new Error('Must be logged in to follow collections');

      const { error } = await supabase
        .from('collection_followers')
        .insert({
          collection_id: collectionId,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-detail'] });
      queryClient.invalidateQueries({ queryKey: ['featured-collections'] });
      
      toast({
        title: 'Following collection',
        description: 'You will be notified of new additions.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to follow collection',
      });
    },
  });

  // Unfollow collection
  const unfollowMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('collection_followers')
        .delete()
        .eq('collection_id', collectionId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection-detail'] });
      queryClient.invalidateQueries({ queryKey: ['featured-collections'] });
      
      toast({
        title: 'Unfollowed collection',
        description: 'You will no longer receive notifications.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to unfollow collection',
      });
    },
  });

  return {
    collections: data?.pages.flatMap((page) => page) || [],
    featuredCollections,
    isLoading,
    fetchNextPage,
    hasNextPage,
    followCollection: followMutation.mutate,
    unfollowCollection: unfollowMutation.mutate,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
    useCollectionDetail,
  };
};
