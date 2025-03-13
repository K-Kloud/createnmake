
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { GalleryImage } from "@/types/gallery";

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
  if (isLoading) {
    return <MarketplaceLoader />;
  }

  return (
    <MarketplaceGrid
      images={images}
      onLike={onLike}
      onView={onView}
      onAddComment={onAddComment}
      onAddReply={onAddReply}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
    />
  );
};
