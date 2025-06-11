
import { ImageCard } from "../ImageCard";
import { GalleryImage } from "@/types/gallery";

interface GalleryImageGridProps {
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onImageClick?: (image: GalleryImage) => void;
}

export const GalleryImageGrid = ({
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  onImageClick
}: GalleryImageGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onLike={onLike}
          onView={onView}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
          onFullImageClick={onImageClick ? () => onImageClick(image) : undefined}
        />
      ))}
    </div>
  );
};
