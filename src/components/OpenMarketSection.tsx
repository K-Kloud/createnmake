
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { useMarketplaceFilters } from "@/components/marketplace/hooks/useMarketplaceFilters";
import { useState } from "react";

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

  const [designStyle, setDesignStyle] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

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

  // Enhanced filtering that includes style, creator and price range
  const enhancedFilteredImages = filteredAndSortedImages.filter(image => {
    // Apply design style filter
    if (designStyle !== 'all') {
      const hasStyle = image.prompt?.toLowerCase().includes(designStyle.toLowerCase());
      if (!hasStyle) return false;
    }
    
    // Apply creator filter
    if (creatorFilter !== 'all' && image.creator.name !== creatorFilter) {
      return false;
    }
    
    // Apply price filter (if the image has a price)
    if (image.price) {
      const price = parseFloat(image.price);
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <section className="py-8">
      <MarketplaceHeader 
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onStyleChange={setDesignStyle}
        onCreatorChange={setCreatorFilter}
        onPriceRangeChange={setPriceRange}
      />
      
      <MarketplaceContent
        isLoading={isLoading}
        images={enhancedFilteredImages}
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
