
import { useToast } from "@/hooks/use-toast";
import { LikeMutationParams } from "@/types/gallery";
import { Session } from "@supabase/supabase-js";

interface MarketplaceActionsProps {
  session: Session | null;
  images: any[];
  likeMutation: {
    mutate: (params: LikeMutationParams) => void;
  };
  viewMutation: {
    mutate: (imageId: number) => void;
  };
  commentMutation: {
    mutate: (params: { imageId: number; text: string; userId: string }) => void;
  };
  replyMutation: {
    mutate: (params: { commentId: number; text: string; userId: string }) => void;
  };
  toast: ReturnType<typeof useToast>["toast"];
}

export const useMarketplaceActions = ({
  session,
  images,
  likeMutation,
  viewMutation,
  commentMutation,
  replyMutation,
  toast
}: MarketplaceActionsProps) => {
  const handleLike = (imageId: number) => {
    // Find the image we want
    const image = images.find(img => img.id === imageId);
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

  return {
    handleLike,
    handleView,
    handleAddComment,
    handleAddReply
  };
};
