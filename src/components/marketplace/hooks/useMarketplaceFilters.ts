import { useState, useMemo } from "react";
import { GalleryImage } from "@/types/gallery";

export const useMarketplaceFilters = (images: GalleryImage[], userId?: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedImages = useMemo(() => {
    if (!images) return [];

    let filtered = images;

    if (searchTerm) {
      filtered = filtered.filter(image => 
        image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(image => {
        const promptCategory = image.prompt.split(":")[0]?.toLowerCase();
        return promptCategory === selectedCategory;
      });
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-liked":
          return (b.metrics?.like || 0) - (a.metrics?.like || 0);
        case "most-viewed":
          return (b.metrics?.view || 0) - (a.metrics?.view || 0);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [images, searchTerm, selectedCategory, sortBy]);

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