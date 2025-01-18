import { useState } from "react";
import { ImageCard } from "@/components/gallery/ImageCard";
import { GalleryImage } from "@/types/gallery";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";

interface MarketplaceGridProps {
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
}

const ITEMS_PER_PAGE = 9;

export const MarketplaceGrid = ({
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
}: MarketplaceGridProps) => {
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const displayedImages = images.slice(0, page * ITEMS_PER_PAGE);

  // Load more images when the last item comes into view
  if (inView && page < totalPages) {
    setPage(prev => prev + 1);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedImages.map((image) => (
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
      
      {page < totalPages && (
        <div ref={ref} className="flex justify-center py-8">
          <Button 
            variant="outline"
            onClick={() => setPage(prev => prev + 1)}
            className="w-full max-w-xs"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};