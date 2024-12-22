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

  if (isLoading) {
    return <MarketplaceLoader />;
  }

  const transformedImages = images?.map(image => 
    transformImage(image, session?.user?.id)
  ) || [];

  return (
    <section className="py-16">
      <MarketplaceHeader />
      <MarketplaceGrid
        images={transformedImages}
        onLike={handleLike}
        onView={handleView}
        onAddComment={handleAddComment}
        onAddReply={handleAddReply}
      />
    </section>
  );
};