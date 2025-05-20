
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ImageCard } from "@/components/gallery/ImageCard";
import { GalleryImage } from "@/types/gallery";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface ImprovedImageGalleryProps {
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  onImageClick: (image: GalleryImage) => void;
  isLoading?: boolean;
  error?: any;
  onRetry?: () => void;
}

export const ImprovedImageGallery = ({
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  onLoadMore,
  hasMore,
  onImageClick,
  isLoading = false,
  error = null,
  onRetry,
}: ImprovedImageGalleryProps) => {
  const { ref, inView } = useInView();
  const { handleError } = useErrorHandler();
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  useEffect(() => {
    if (inView && hasMore && !isLoading && !error) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore, isLoading, error]);

  useEffect(() => {
    if (!isLoading && images.length === 0 && !error) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
  }, [images, isLoading, error]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Failed to load images</h3>
        <p className="text-muted-foreground mb-6">
          {error.message || "There was a problem loading the gallery"}
        </p>
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading && images.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square bg-muted/40 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-xl font-semibold">No images found</h3>
        <p className="text-muted-foreground mt-2">
          There are no images to display at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="transform transition-all duration-300 hover:scale-[1.02]"
          >
            <ImageCard
              image={image}
              onLike={onLike}
              onView={onView}
              onAddComment={onAddComment}
              onAddReply={onAddReply}
              onFullImageClick={() => onImageClick(image)}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};
