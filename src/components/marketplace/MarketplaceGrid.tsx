
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { ImageCard } from "@/components/gallery/ImageCard";
import { GalleryImage } from "@/types/gallery";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";

interface MarketplaceGridProps {
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  onImageClick: (image: GalleryImage) => void;
}

export const MarketplaceGrid = ({
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  onLoadMore,
  hasMore,
  onImageClick,
}: MarketplaceGridProps) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore]);

  return (
    <EnhancedErrorBoundary>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <EnhancedErrorBoundary
              key={image.id}
              fallback={
                <div className="aspect-square bg-muted/40 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Failed to load image</p>
                </div>
              }
            >
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <ImageCard
                  image={image}
                  onLike={onLike}
                  onView={onView}
                  onAddComment={onAddComment}
                  onAddReply={onAddReply}
                  onFullImageClick={() => onImageClick(image)}
                />
              </div>
            </EnhancedErrorBoundary>
          ))}
        </div>
        {hasMore && (
          <div ref={ref} className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </EnhancedErrorBoundary>
  );
};
