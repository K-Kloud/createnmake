import { ImageCard } from "@/components/gallery/ImageCard";
import { GalleryImage } from "@/types/gallery";

interface MarketplaceGridProps {
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
}

export const MarketplaceGrid = ({
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
}: MarketplaceGridProps) => {
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
        />
      ))}
    </div>
  );
};