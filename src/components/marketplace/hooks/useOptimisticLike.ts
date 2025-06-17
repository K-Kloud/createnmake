
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { LikeMutationParams, GalleryImage } from '@/types/gallery';

interface OptimisticLikeOptions {
  likeMutation: {
    mutate: (params: LikeMutationParams) => void;
    isPending: boolean;
  };
}

export function useOptimisticLike({ likeMutation }: OptimisticLikeOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const optimisticLike = async (imageId: number, currentHasLiked: boolean, userId: string) => {
    // Prevent multiple simultaneous requests
    if (likeMutation.isPending) {
      console.log('🔴 Like operation already in progress, skipping');
      return;
    }

    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['marketplace-images'] });
    
    // Snapshot the previous value
    const previousData = queryClient.getQueryData(['marketplace-images']);
    
    // Optimistically update the cache with more accurate logic
    queryClient.setQueriesData(
      { queryKey: ['marketplace-images'] },
      (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: GalleryImage[]) =>
            page.map((image: GalleryImage) =>
              image.id === imageId
                ? {
                    ...image,
                    hasLiked: !currentHasLiked,
                    metrics: {
                      ...image.metrics,
                      like: currentHasLiked 
                        ? Math.max(0, (image.metrics?.like || 0) - 1)
                        : (image.metrics?.like || 0) + 1
                    },
                    likes: currentHasLiked 
                      ? Math.max(0, (image.likes || 0) - 1)
                      : (image.likes || 0) + 1
                  }
                : image
            )
          ),
        };
      }
    );

    try {
      // Perform the actual mutation
      likeMutation.mutate({
        imageId,
        hasLiked: currentHasLiked,
        userId
      });
    } catch (error) {
      // If the mutation fails, revert the optimistic update
      queryClient.setQueryData(['marketplace-images'], previousData);
      
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { optimisticLike };
}
