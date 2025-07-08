import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useLikeMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, hasLiked, userId }: { imageId: number; hasLiked: boolean; userId: string }) => {
      console.log('🔴 Like mutation starting:', { imageId, hasLiked, userId });
      
      try {
        // Use the atomic like function for consistency
        const { data, error } = await supabase
          .rpc('atomic_like_image', {
            p_image_id: imageId,
            p_user_id: userId
          });

        if (error) {
          console.error('🔴 Atomic like function error:', error);
          throw error;
        }

        console.log('🔴 Atomic like function result:', data);
        return data;
      } catch (error: any) {
        console.error('🔴 Like mutation error:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('🔴 Like mutation failed:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });
};