
import { useState, useMemo } from "react";
import { Session } from "@supabase/supabase-js";
import { transformImage } from "@/utils/transformers";
import { parsePrice } from "@/lib/utils";

export const useMarketplaceFilters = (images: any[], session: Session | null) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredAndSortedImages = useMemo(() => {
    if (!images?.length) return [];

    let filtered = images.map(image => 
      transformImage(image, session?.user?.id)
    );

    // Apply search filter with null/undefined checks
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(image => {
        const prompt = image.prompt || '';
        const creatorName = image.creator?.name || '';
        return prompt.toLowerCase().includes(searchLower) ||
               creatorName.toLowerCase().includes(searchLower);
      });
    }

    // Apply category filter with null/undefined checks
    if (selectedCategory !== "all") {
      filtered = filtered.filter(image => {
        const prompt = image.prompt || '';
        const itemType = image.item_type || '';
        return prompt.toLowerCase().includes(selectedCategory.toLowerCase()) ||
               itemType.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(image => {
        const imageTags = image.tags || [];
        const prompt = image.prompt || '';
        return selectedTags.some(tag => 
          imageTags.includes(tag) || 
          prompt.toLowerCase().includes(tag.toLowerCase())
        );
      });
    }

    // Apply sorting with proper fallback values
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-liked":
          return (b.metrics?.like || b.likes || 0) - (a.metrics?.like || a.likes || 0);
        case "most-viewed":
          return (b.metrics?.view || b.views || 0) - (a.metrics?.view || a.views || 0);
        case "price-high":
          return parsePrice(b.price || '0') - parsePrice(a.price || '0');
        case "price-low":
          return parsePrice(a.price || '0') - parsePrice(b.price || '0');
        case "best-rated":
          const aLikes = (a.metrics?.like || 0);
          const bLikes = (b.metrics?.like || 0);
          return bLikes - aLikes;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [images, searchTerm, selectedCategory, sortBy, session?.user?.id]);

  // Extract unique tags from all images
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    images.forEach(img => {
      if (img.tags && Array.isArray(img.tags)) {
        img.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [images]);

  return {
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
  };
};
