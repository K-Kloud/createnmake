import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { transformImage } from "@/utils/transformers";

export const OpenMarketSection = () => {
  const {
    session,
    images: rawImages,
    isLoading,
    likeMutation,
    viewMutation,
    commentMutation,
    replyMutation,
    toast
  } = useMarketplace();

  const handleLike = (imageId: number) => {
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
      hasLiked: Boolean(rawImages?.find(img => img.id === imageId)?.image_likes?.some(like => like.user_id === session.user.id)), 
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

  // Transform the raw images to match GalleryImage type
  const transformedImages = rawImages?.map(img => transformImage(img, session?.user?.id)) || [];

  return (
    <section className="py-16">
      <MarketplaceContent
        images={transformedImages}
        onLike={handleLike}
        onView={handleView}
        onAddComment={handleAddComment}
        onAddReply={handleAddReply}
        userId={session?.user?.id}
      />
    </section>
  );
};