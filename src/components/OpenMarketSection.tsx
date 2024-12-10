import { ImageCard } from "@/components/gallery/ImageCard";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { useMarketplace } from "@/components/marketplace/useMarketplace";

export const OpenMarketSection = () => {
  const {
    session,
    images,
    isLoading,
    likeMutation,
    viewMutation,
    toast
  } = useMarketplace();

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

    likeMutation.mutate({ imageId, hasLiked: image.hasLiked });
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
    console.log('Comment added to image:', imageId, commentText);
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
    console.log('Reply added to comment:', commentId, replyText);
  };

  if (isLoading) {
    return <MarketplaceLoader />;
  }

  return (
    <section className="py-16">
      <MarketplaceHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images?.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onLike={handleLike}
            onView={handleView}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
          />
        ))}
      </div>
    </section>
  );
};