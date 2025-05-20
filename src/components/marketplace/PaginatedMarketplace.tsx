
import { useState } from "react";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { LoadingState } from "@/components/ui/loading-state";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { GalleryImage } from "@/types/gallery";

interface PaginatedMarketplaceProps {
  images: GalleryImage[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onImageClick: (image: GalleryImage) => void;
  pageSize?: number;
}

export const PaginatedMarketplace = ({
  images,
  isLoading,
  error,
  onRetry,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  onImageClick,
  pageSize = 9
}: PaginatedMarketplaceProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(images.length / pageSize));
  
  // Get current page's images
  const getCurrentImages = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return images.slice(startIndex, endIndex);
  };
  
  const currentImages = getCurrentImages();
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingComponent={<SkeletonLoader type="card" count={pageSize} />}
    >
      <div className="space-y-8">
        <MarketplaceGrid
          images={currentImages}
          onLike={onLike}
          onView={onView}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
          onLoadMore={() => {}} // No need for infinite loading with pagination
          hasMore={false}
          onImageClick={onImageClick}
        />
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <EnhancedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </LoadingState>
  );
};
