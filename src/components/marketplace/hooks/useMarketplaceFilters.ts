
import { useState, useMemo } from "react";
import { Session } from "@supabase/supabase-js";
import { transformImage } from "@/utils/transformers";
import { parsePrice } from "@/lib/utils";

export const useMarketplaceFilters = (images: any[], session: Session | null) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedImages = useMemo(() => {
    if (!images?.length) return [];

    let filtered = images.map(image => 
      transformImage(image, session?.user?.id)
    );

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(image => 
        image.prompt.toLowerCase().includes(searchLower) ||
        image.creator.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(image => {
        const promptLower = image.prompt.toLowerCase();
        return promptLower.includes(selectedCategory.toLowerCase());
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-liked":
          return (b.metrics?.like || b.likes || 0) - (a.metrics?.like || a.likes || 0);
        case "most-viewed":
          return (b.metrics?.view || b.views || 0) - (a.metrics?.view || a.views || 0);
        case "price-high":
          return parsePrice(b.price) - parsePrice(a.price);
        case "price-low":
          return parsePrice(a.price) - parsePrice(b.price);
        case "best-rated":
          // Use likes as a proxy for rating since we don't have a dedicated rating field
          const aLikes = (a.metrics?.like || 0);
          const bLikes = (b.metrics?.like || 0);
          return bLikes - aLikes;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [images, searchTerm, selectedCategory, sortBy, session?.user?.id]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredAndSortedImages
  };
};
