import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GalleryImage } from "@/types/gallery";

export const useLikeMutation = (images?: GalleryImage[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, hasLiked, userId }: { imageId: number; hasLiked: boolean; userId: string }) => {
      try {
        if (hasLiked) {
          const { error: deleteLikeError } = await supabase
            .from('image_likes')
            .delete()
            .eq('image_id', imageId)
            .eq('user_id', userId);

          if (deleteLikeError) throw deleteLikeError;

          const { error: updateLikesError } = await supabase
            .from('generated_images')
            .update({ likes: images?.find(img => img.id === imageId)?.likes - 1 || 0 })
            .eq('id', imageId);

          if (updateLikesError) throw updateLikesError;
        } else {
          const { data: existingLike, error: checkError } = await supabase
            .from('image_likes')
            .select()
            .eq('image_id', imageId)
            .eq('user_id', userId)
            .maybeSingle();

          if (checkError) throw checkError;

          if (existingLike) {
            toast({
              title: "Already Liked",
              description: "You have already liked this image",
              variant: "destructive",
            });
            return;
          }

          const { error: insertLikeError } = await supabase
            .from('image_likes')
            .insert({ image_id: imageId, user_id: userId });

          if (insertLikeError) throw insertLikeError;

          const { error: updateLikesError } = await supabase
            .from('generated_images')
            .update({ likes: images?.find(img => img.id === imageId)?.likes + 1 || 1 })
            .eq('id', imageId);

          if (updateLikesError) throw updateLikesError;
        }
      } catch (error: any) {
        console.error('Like mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceImages'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};