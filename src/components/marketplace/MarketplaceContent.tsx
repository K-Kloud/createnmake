
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { GalleryImage } from "@/types/gallery";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { ImagePreviewDialog } from "@/components/gallery/ImagePreviewDialog";

interface MarketplaceContentProps {
  isLoading: boolean;
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const MarketplaceContent = ({
  isLoading,
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  onLoadMore,
  hasMore
}: MarketplaceContentProps) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (isLoading) {
    return <MarketplaceLoader />;
  }

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsPreviewOpen(true);
    setZoomLevel(1);
    onView(image.id);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <>
      <MarketplaceGrid
        images={images}
        onLike={onLike}
        onView={onView}
        onAddComment={onAddComment}
        onAddReply={onAddReply}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        onImageClick={handleImageClick}
      />

      {selectedImage && (
        <ImagePreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          imageUrl={selectedImage.url}
          prompt={selectedImage.prompt}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          imageId={selectedImage.id}
          userId={selectedImage.user_id}
        />
      )}
    </>
  );
};
