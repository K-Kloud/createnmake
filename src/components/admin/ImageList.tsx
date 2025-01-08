import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GeneratedImage = Database['public']['Tables']['generated_images']['Row'] & {
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

interface ImageListProps {
  images: GeneratedImage[];
  onDelete: (id: number) => Promise<void>;
  onView: () => void;
}

export const ImageList = ({ images, onDelete, onView }: ImageListProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      setDeletingId(id);

      // 1. First, get all comments for this image
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
        // Delete all replies for all comments
        await Promise.all(comments.map(async (comment) => {
          const { error: replyError } = await supabase
            .from('comment_replies')
            .delete()
            .eq('comment_id', comment.id);
          
          if (replyError) {
            console.error('Error deleting replies:', replyError);
            throw replyError;
          }
        }));

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

      toast({
        title: "Success",
        description: "Image and related data deleted successfully",
      });

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images?.map((image) => (
        <Card key={image.id} className="p-4">
          <img
            src={image.image_url}
            alt={image.prompt || 'Generated image'}
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
          <p className="text-sm text-gray-600 mb-2">{image.prompt}</p>
          <p className="text-xs text-gray-500 mb-2">
            Created: {new Date(image.created_at).toLocaleDateString()}
          </p>
          <Button
            variant="destructive"
            onClick={() => handleDelete(image.id)}
            disabled={isDeleting && deletingId === image.id}
            className="w-full"
          >
            {isDeleting && deletingId === image.id ? 'Deleting...' : 'Delete'}
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default ImageList;