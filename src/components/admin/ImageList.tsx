import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

type TableName = keyof Database["public"]["Tables"];

export const ImageList = () => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteWithToast = async (table: TableName, match: Record<string, any>) => {
    const { error } = await supabase.from(table).delete().match(match);
    if (error) throw error;
  };

  const handleDelete = async (id: number) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // 1. Get all comments for this image first
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('image_id', id);

      if (commentsError) throw commentsError;

      // 2. If there are comments, delete their replies first
      if (comments && comments.length > 0) {
        // Delete all replies for all comments in one go
        for (const comment of comments) {
          const { error: replyError } = await supabase
            .from('comment_replies')
            .delete()
            .eq('comment_id', comment.id);
          
          if (replyError) throw replyError;
        }

        // 3. Then delete all comments for this image
        const { error: commentError } = await supabase
          .from('comments')
          .delete()
          .eq('image_id', id);
        
        if (commentError) throw commentError;
      }

      // 4. Delete marketplace metrics
      const { error: metricsError } = await supabase
        .from('marketplace_metrics')
        .delete()
        .eq('image_id', id);

      if (metricsError) throw metricsError;

      // 5. Delete image likes
      const { error: likesError } = await supabase
        .from('image_likes')
        .delete()
        .eq('image_id', id);

      if (likesError) throw likesError;

      // 6. Finally delete the image
      const { error: imageError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (imageError) throw imageError;

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
    }
  };

  const { data: images, isLoading } = useQuery({
    queryKey: ['admin-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images?.map((image) => (
          <Card key={image.id} className="p-4">
            <img
              src={image.url}
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
              disabled={isDeleting}
              className="w-full"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageList;