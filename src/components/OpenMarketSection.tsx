
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { useMarketplaceFilters } from "@/components/marketplace/hooks/useMarketplaceFilters";
import { useState } from "react";
import { parsePrice } from "@/lib/utils";

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
    selectedTags,
    setSelectedTags,
    availableTags,
    filteredAndSortedImages
  } = useMarketplaceFilters(
    images?.pages?.flatMap(page => page) || [], 
    session
  );

  // Enhanced filtering with proper null/undefined checks
  const enhancedFilteredImages = filteredAndSortedImages.filter(image => {
    // Apply design style filter with null check
    if (designStyle !== 'all') {
      const prompt = image.prompt || '';
      const hasStyle = prompt.toLowerCase().includes(designStyle.toLowerCase());
      if (!hasStyle) return false;
    }
    
    // Apply creator filter with null check
    if (creatorFilter !== 'all') {
      const creatorName = image.creator?.name || '';
      if (creatorName !== creatorFilter) {
        return false;
      }
    }
    
    // Apply price filter with null check
    if (image.price) {
      const price = parsePrice(image.price);
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
        onTagsChange={setSelectedTags}
        availableTags={availableTags}
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
