import { MarketplaceGrid } from "./MarketplaceGrid";
import { MarketplaceHeader } from "./MarketplaceHeader";
import { useMarketplaceFilters } from "./hooks/useMarketplaceFilters";
import { GalleryImage } from "@/types/gallery";

interface MarketplaceContentProps {
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  userId?: string;
}

export const MarketplaceContent = ({
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  userId
}: MarketplaceContentProps) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredAndSortedImages
  } = useMarketplaceFilters(images, userId);

  return (
    <>
      <MarketplaceHeader 
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
      />
      <MarketplaceGrid
        images={filteredAndSortedImages}
        onLike={onLike}
        onView={onView}
        onAddComment={onAddComment}
        onAddReply={onAddReply}
      />
    </>
  );
};