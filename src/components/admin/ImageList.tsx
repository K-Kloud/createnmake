import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageListHeader } from "./images/ImageListHeader";
import { ImageListRow } from "./images/ImageListRow";
import { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];

interface ImageListProps {
  images: any[];
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export const ImageList = ({ images, onDelete, onView }: ImageListProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const startEditing = (image: any) => {
    setEditingId(image.id);
    setEditData({
      title: image.title || '',
      prompt: image.prompt || '',
      likes: image.likes || 0,
      views: image.views || 0
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveChanges = async (id: number) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({
          title: editData.title,
          prompt: editData.prompt,
          likes: parseInt(editData.likes),
          views: parseInt(editData.views)
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "The image details have been updated successfully."
      });
      
      setEditingId(null);
      setEditData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    const deleteWithToast = async (
      tableName: TableName,
      condition: Record<string, any>
    ) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .match(condition);

      if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        throw error;
      }
    };

    try {
      // 1. Get all comments for this image
      const { data: comments, error: commentsQueryError } = await supabase
        .from('comments')
        .select('id')
        .eq('image_id', id);

      if (commentsQueryError) throw commentsQueryError;

      // 2. If there are comments, delete their replies first
      if (comments && comments.length > 0) {
        const commentIds = comments.map(comment => comment.id);
        
        // Delete all replies for all comments
        await deleteWithToast('comment_replies', { comment_id: commentIds[0] });
        
        // Delete remaining replies if any
        for (let i = 1; i < commentIds.length; i++) {
          await deleteWithToast('comment_replies', { comment_id: commentIds[i] });
        }

        // 3. Delete all comments for this image
        await deleteWithToast('comments', { image_id: id });
      }

      // 4. Delete marketplace metrics
      await deleteWithToast('marketplace_metrics', { image_id: id });

      // 5. Delete image likes
      await deleteWithToast('image_likes', { image_id: id });

      // 6. Finally delete the image
      await deleteWithToast('generated_images', { id });

      // 7. Call the parent's onDelete handler
      onDelete(id);

      toast({
        title: "Image deleted",
        description: "The image and its related data have been successfully deleted."
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Table>
      <ImageListHeader />
      <TableBody>
        {images.map((image) => (
          <ImageListRow
            key={image.id}
            image={image}
            editingId={editingId}
            editData={editData}
            onEdit={startEditing}
            onSave={saveChanges}
            onCancel={cancelEditing}
            onDelete={handleDelete}
            onEditDataChange={setEditData}
          />
        ))}
        {images.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No images found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};