import { ImageCard } from "@/components/gallery/ImageCard";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { useMarketplace } from "@/components/marketplace/useMarketplace";
import { GalleryImage, Comment, Reply } from "@/types/gallery";

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

  const transformComments = (comments: any[]): Comment[] => {
    return comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      user: {
        id: comment.user_id,
        name: comment.profiles?.username || 'Anonymous',
        avatar: comment.profiles?.avatar_url || '/placeholder.svg'
      },
      createdAt: new Date(comment.created_at),
      replies: comment.comment_replies?.map((reply: any): Reply => ({
        id: reply.id,
        text: reply.text,
        user: {
          id: reply.user_id,
          name: reply.profiles?.username || 'Anonymous',
          avatar: reply.profiles?.avatar_url || '/placeholder.svg'
        },
        createdAt: new Date(reply.created_at)
      })) || []
    }));
  };

  if (isLoading) {
    return <MarketplaceLoader />;
  }

  return (
    <section className="py-16">
      <MarketplaceHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images?.map((image) => {
          const galleryImage: GalleryImage = {
            id: image.id,
            url: image.image_url || '',
            prompt: image.prompt,
            likes: image.likes || 0,
            views: image.views || 0,
            comments: transformComments(image.comments || []),
            produced: 0,
            creator: {
              name: image.profiles?.username || 'Anonymous',
              avatar: image.profiles?.avatar_url || '/placeholder.svg'
            },
            createdAt: new Date(image.created_at || ''),
            hasLiked: Boolean(image.image_likes?.some(like => like.user_id === session?.user?.id)),
            image_likes: image.image_likes || [],
            metrics: {
              like: image.likes || 0,
              comment: (image.comments || []).length,
              view: image.views || 0
            }
          };

          return (
            <ImageCard
              key={image.id}
              image={galleryImage}
              onLike={handleLike}
              onView={handleView}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
            />
          );
        })}
      </div>
    </section>
  );
};