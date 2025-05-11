
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageDeletion = (onClose: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (imageId?: number, userId?: string, canDelete?: boolean) => {
    if (!imageId || !canDelete) {
      toast({
        title: "Error",
        description: "You don't have permission to delete this image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);

      // First, get all comment IDs for this image
      const { data: commentIds, error: commentIdsError } = await supabase
        .from('comments')
        .select('id')
        .eq('image_id', imageId);

      if (commentIdsError) {
        console.error('Error fetching comment IDs:', commentIdsError);
        throw commentIdsError;
      }

      // Delete comment replies for all comments of this image
      if (commentIds && commentIds.length > 0) {
        const { error: repliesError } = await supabase
          .from('comment_replies')
          .delete()
          .in('comment_id', commentIds.map(c => c.id));

        if (repliesError) {
          console.error('Error deleting comment replies:', repliesError);
          throw repliesError;
        }
      }

      // Then, delete comments
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('image_id', imageId);

      if (commentsError) {
        console.error('Error deleting comments:', commentsError);
        throw commentsError;
      }

      // Next, delete related metrics
      const { error: metricsError } = await supabase
        .from('marketplace_metrics')
        .delete()
        .eq('image_id', imageId);

      if (metricsError) {
        console.error('Error deleting metrics:', metricsError);
        throw metricsError;
      }

      // Finally delete the image
      const { error: imageError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId);

      if (imageError) throw imageError;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDelete
  };
};
