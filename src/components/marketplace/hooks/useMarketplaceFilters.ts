
import { useState, useMemo } from "react";
import { GalleryImage } from "@/types/gallery";
import { Session } from "@supabase/supabase-js";
import { transformImage } from "@/utils/transformers";

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
        const promptCategory = image.prompt.split(":")[0]?.toLowerCase();
        return promptCategory === selectedCategory;
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-liked":
          return (b.metrics.like || 0) - (a.metrics.like || 0);
        case "most-viewed":
          return (b.metrics.view || 0) - (a.metrics.view || 0);
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
