import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageListHeader } from "./images/ImageListHeader";
import { ImageListRow } from "./images/ImageListRow";

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
    try {
      // First, delete all comments associated with the image
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('image_id', id);

      if (commentsError) throw commentsError;

      // Then, delete related marketplace metrics
      const { error: metricsError } = await supabase
        .from('marketplace_metrics')
        .delete()
        .eq('image_id', id);

      if (metricsError) throw metricsError;

      // Delete image likes
      const { error: likesError } = await supabase
        .from('image_likes')
        .delete()
        .eq('image_id', id);

      if (likesError) throw likesError;

      // Finally, delete the image
      const { error: imageError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (imageError) throw imageError;

      // Call the parent's onDelete handler
      onDelete(id);

      toast({
        title: "Image deleted",
        description: "The image and its related data have been successfully deleted."
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
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