
import { useQueryClient } from '@tanstack/react-query';
import { LikeMutationParams, GalleryImage } from '@/types/gallery';

interface OptimisticLikeOptions {
  likeMutation: {
    mutate: (params: LikeMutationParams) => void;
    isPending: boolean;
  };
}

export function useOptimisticLike({ likeMutation }: OptimisticLikeOptions) {
  const queryClient = useQueryClient();
  
  const optimisticLike = async (imageId: number, currentHasLiked: boolean, userId: string) => {
    console.log('🔴 Optimistic like starting:', { imageId, currentHasLiked, userId, isPending: likeMutation.isPending });
    
    // Prevent multiple simultaneous requests
    if (likeMutation.isPending) {
      console.log('🔴 Like operation already in progress, skipping');
      return;
    }

    // Cancel any outgoing refetches to avoid conflicts
    await queryClient.cancelQueries({ queryKey: ['marketplace-images'] });
    
    // Snapshot the previous value for rollback
    const previousData = queryClient.getQueryData(['marketplace-images']);
    
    // Optimistically update the cache
    queryClient.setQueryData(['marketplace-images'], (oldData: any) => {
      if (!oldData) return oldData;
      
      console.log('🔴 Applying optimistic update to data');
      
      // Handle both paginated and non-paginated data
      if (oldData.pages) {
        return {
          ...oldData,
          pages: oldData.pages.map((page: GalleryImage[]) =>
            page.map((image: GalleryImage) =>
              image.id === imageId ? {
                ...image,
                hasLiked: !currentHasLiked,
                likes: currentHasLiked 
                  ? Math.max(0, (image.likes || 0) - 1)
                  : (image.likes || 0) + 1,
                metrics: {
                  ...image.metrics,
                  like: currentHasLiked 
                    ? Math.max(0, (image.metrics?.like || 0) - 1)
                    : (image.metrics?.like || 0) + 1
                }
              } : image
            )
          ),
        };
      } else if (Array.isArray(oldData)) {
        return oldData.map((image: GalleryImage) =>
          image.id === imageId ? {
            ...image,
            hasLiked: !currentHasLiked,
            likes: currentHasLiked 
              ? Math.max(0, (image.likes || 0) - 1)
              : (image.likes || 0) + 1,
            metrics: {
              ...image.metrics,
              like: currentHasLiked 
                ? Math.max(0, (image.metrics?.like || 0) - 1)
                : (image.metrics?.like || 0) + 1
            }
          } : image
        );
      }
      
      return oldData;
    });

    try {
      // Perform the actual mutation
      likeMutation.mutate({
        imageId,
        hasLiked: currentHasLiked,
        userId
      });
    } catch (error) {
      console.error('🔴 Optimistic like error, rolling back:', error);
      // Rollback on error
      queryClient.setQueryData(['marketplace-images'], previousData);
    }
  };

  return { optimisticLike };
}
