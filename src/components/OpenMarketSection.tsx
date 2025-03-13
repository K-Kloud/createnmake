
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { useMarketplaceFilters } from "@/components/marketplace/hooks/useMarketplaceFilters";

export const OpenMarketSection = () => {
  const {
    session,
    images,
    isLoading,
    fetchNextPage,
    hasNextPage,
    handleLike,
    handleView,
    handleAddComment,
    handleAddReply
  } = useMarketplace();

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredAndSortedImages
  } = useMarketplaceFilters(
    images?.pages?.flatMap(page => page) || [], 
    session
  );

  return (
    <section className="py-16">
      <MarketplaceHeader 
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
      />
      
      <MarketplaceContent
        isLoading={isLoading}
        images={filteredAndSortedImages}
        onLike={handleLike}
        onView={handleView}
        onAddComment={handleAddComment}
        onAddReply={handleAddReply}
        onLoadMore={fetchNextPage}
        hasMore={!!hasNextPage}
      />
    </section>
  );
};
