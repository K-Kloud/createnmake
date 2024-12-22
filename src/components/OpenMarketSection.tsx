import { ImageCard } from "@/components/gallery/ImageCard";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { GalleryImage } from "@/types/gallery";

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
      hasLiked: Boolean(image.hasLiked), 
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

  return (
    <section className="py-16">
      <MarketplaceHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images?.map((image) => (
          <ImageCard
            key={image.id}
            image={{
              id: image.id,
              url: image.image_url || '',
              prompt: image.prompt,
              likes: image.likes || 0,
              views: image.views || 0,
              comments: image.comments || [],
              produced: 0,
              creator: {
                name: image.profiles?.username || 'Anonymous',
                avatar: image.profiles?.avatar_url || '/placeholder.svg'
              },
              createdAt: new Date(image.created_at || ''),
              hasLiked: Boolean(image.hasLiked),
              image_likes: image.image_likes || [],
              metrics: {
                like: image.metrics?.like || 0,
                comment: image.metrics?.comment || 0,
                view: image.metrics?.view || 0
              }
            }}
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