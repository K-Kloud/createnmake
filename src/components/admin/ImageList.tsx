
import { useState } from "react";
import { useImageDeletion } from "./hooks/useImageDeletion";
import { ImageListHeader } from "./images/ImageListHeader";
import { ImageListRow } from "./images/ImageListRow";
import { Loader2 } from "lucide-react";

interface ImageListProps {
  images: any[];
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const ImageList = ({ images, onDelete, isLoading = false }: ImageListProps) => {
  const { deletingId, handleDelete } = useImageDeletion(onDelete);

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
