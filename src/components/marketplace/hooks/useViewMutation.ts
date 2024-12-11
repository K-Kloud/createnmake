import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GalleryImage } from "@/types/gallery";

export const useViewMutation = (images?: GalleryImage[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: number) => {
      const currentViews = images?.find(img => img.id === imageId)?.views || 0;
      const { error } = await supabase
        .from('generated_images')
        .update({ views: currentViews + 1 })
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceImages'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update view count",
        variant: "destructive",
      });
    },
  });
};