
import { useState } from "react";
import { useImageDeletion } from "./hooks/useImageDeletion";
import { ImageListHeader } from "./images/ImageListHeader";
import { ImageListRow } from "./images/ImageListRow";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageListProps {
  images: any[];
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const ImageList = ({ images, onDelete, isLoading = false }: ImageListProps) => {
  const { deletingId, handleDelete } = useImageDeletion(onDelete);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const handleEdit = (image: any) => {
    setEditingId(image.id);
    setEditData({
      title: image.title || '',
      prompt: image.prompt || '',
      likes: image.likes || 0,
      views: image.views || 0
    });
  };

  const handleSave = async (id: number) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({
          title: editData.title,
          prompt: editData.prompt,
          likes: parseInt(editData.likes) || 0,
          views: parseInt(editData.views) || 0
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Image updated successfully');
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
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
            editingId={editingId}
            editData={editData}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onEditDataChange={setEditData}
          />
        ))}
      </div>
    </div>
  );
};
