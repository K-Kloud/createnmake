
import { useState, useMemo } from "react";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { transformImage } from "@/utils/transformers";

export const OpenMarketSection = () => {
  const {
    session,
    images,
    isLoading,
    likeMutation,
    viewMutation,
    commentMutation,
    replyMutation,
    toast,
    fetchNextPage,
    hasNextPage,
  } = useMarketplace();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleLike = (imageId: number) => {
    const image = images?.find(img => img.id === imageId);
    if (!image) return;

    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like images",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate({ 
      imageId, 
      hasLiked: Boolean(image.image_likes?.some(like => like.user_id === session.user.id)), 
      userId: session.user.id 
    });
  };

  const handleView = (imageId: number) => {
    viewMutation.mutate(imageId);
  };

  const handleAddComment = (imageId: number, commentText: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate({
      imageId,
      text: commentText,
      userId: session.user.id
    });
  };

  const handleAddReply = (imageId: number, commentId: number, replyText: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply",
        variant: "destructive",
      });
      return;
    }
    replyMutation.mutate({
      commentId,
      text: replyText,
      userId: session.user.id
    });
  };

  const filteredAndSortedImages = useMemo(() => {
    if (!images?.pages?.length) return [];

    let filtered = images.pages.flatMap(page => 
      page.map(image => transformImage(image, session?.user?.id))
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
  }, [images?.pages, searchTerm, selectedCategory, sortBy, session?.user?.id]);

  return (
    <section className="py-16">
      <MarketplaceHeader 
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
      />
      {isLoading ? (
        <MarketplaceLoader />
      ) : (
        <MarketplaceGrid
          images={filteredAndSortedImages}
          onLike={handleLike}
          onView={handleView}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onLoadMore={fetchNextPage}
          hasMore={hasNextPage}
        />
      )}
    </section>
  );
};
