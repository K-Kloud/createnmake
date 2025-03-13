
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageListHeader } from "./images/ImageListHeader";
import { ImageListRow } from "./images/ImageListRow";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ImageListProps {
  images: any[];
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const ImageList = ({ images, onDelete, isLoading = false }: ImageListProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);

      // 1. First get all comments for this image
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('image_id', id);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }

      // 2. Delete comment replies and comments
      if (comments && comments.length > 0) {
        // Delete all replies first
        const { error: replyError } = await supabase
          .from('comment_replies')
          .delete()
          .eq('comment_id', comments[0].id);
        
        if (replyError) {
          console.error('Error deleting replies:', replyError);
          throw replyError;
        }

        // Now delete all comments
        const { error: deleteCommentsError } = await supabase
          .from('comments')
          .delete()
          .eq('image_id', id);
        
        if (deleteCommentsError) {
          console.error('Error deleting comments:', deleteCommentsError);
          throw deleteCommentsError;
        }
      }

      // 3. Delete marketplace metrics
      const { error: metricsError } = await supabase
        .from('marketplace_metrics')
        .delete()
        .eq('image_id', id);

      if (metricsError) {
        console.error('Error deleting metrics:', metricsError);
        throw metricsError;
      }

      // 4. Delete image likes
      const { error: likesError } = await supabase
        .from('image_likes')
        .delete()
        .eq('image_id', id);

      if (likesError) {
        console.error('Error deleting likes:', likesError);
        throw likesError;
      }

      // 5. Finally delete the image
      const { error: imageError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (imageError) {
        console.error('Error deleting image:', imageError);
        throw imageError;
      }

      // 6. Call the onDelete callback to update the UI
      await onDelete(id);
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(`Failed to delete image: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ImageListHeader />
      <div className="space-y-2">
        {images.map((image) => (
          <ImageListRow
            key={image.id}
            image={image}
            onDelete={() => handleDelete(image.id)}
            isDeleting={deletingId === image.id}
          />
        ))}
      </div>
    </div>
  );
};
