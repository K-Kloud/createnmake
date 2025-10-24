import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  image_count: number;
  created_at: string;
  updated_at: string;
}

export const useCollections = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's collections
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('image_collections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Collection[];
    },
    enabled: !!userId,
  });

  // Create new collection
  const createCollectionMutation = useMutation({
    mutationFn: async (params: { name: string; description?: string; isPublic?: boolean }) => {
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('image_collections')
        .insert({
          user_id: userId,
          name: params.name,
          description: params.description || '',
          is_public: params.isPublic ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      toast({
        title: 'Collection created',
        description: 'Your new collection has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create collection',
      });
    },
  });

  // Add image to collection
  const addToCollectionMutation = useMutation({
    mutationFn: async (params: { collectionId: string; imageId: number }) => {
      // Check if image already exists in collection
      const { data: existing } = await supabase
        .from('collection_images')
        .select('id')
        .eq('collection_id', params.collectionId)
        .eq('image_id', params.imageId)
        .single();

      if (existing) {
        throw new Error('Image already in collection');
      }

      const { data, error } = await supabase
        .from('collection_images')
        .insert({
          collection_id: params.collectionId,
          image_id: params.imageId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      queryClient.invalidateQueries({ queryKey: ['collection-images', variables.collectionId] });
      
      toast({
        title: 'Added to collection',
        description: 'Image has been added to your collection.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add image to collection',
      });
    },
  });

  // Remove image from collection
  const removeFromCollectionMutation = useMutation({
    mutationFn: async (params: { collectionId: string; imageId: number }) => {
      const { error } = await supabase
        .from('collection_images')
        .delete()
        .eq('collection_id', params.collectionId)
        .eq('image_id', params.imageId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      queryClient.invalidateQueries({ queryKey: ['collection-images', variables.collectionId] });
      
      toast({
        title: 'Removed from collection',
        description: 'Image has been removed from your collection.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to remove image from collection',
      });
    },
  });

  // Update collection cover image
  const updateCoverImageMutation = useMutation({
    mutationFn: async (params: { collectionId: string; coverImageUrl: string }) => {
      const { data, error } = await supabase
        .from('image_collections')
        .update({ 
          cover_image_url: params.coverImageUrl,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', params.collectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', userId] });
      toast({
        title: 'Cover updated',
        description: 'Collection cover image has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update cover image',
      });
    },
  });

  return {
    collections,
    isLoading,
    createCollection: createCollectionMutation.mutate,
    addToCollection: addToCollectionMutation.mutate,
    removeFromCollection: removeFromCollectionMutation.mutate,
    updateCoverImage: updateCoverImageMutation.mutate,
    isAddingToCollection: addToCollectionMutation.isPending,
    isCreatingCollection: createCollectionMutation.isPending,
  };
};
