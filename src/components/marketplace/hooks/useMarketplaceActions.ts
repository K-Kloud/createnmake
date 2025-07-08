
import { useToast } from "@/hooks/use-toast";
import { LikeMutationParams } from "@/types/gallery";
import { Session } from "@supabase/supabase-js";
import { useOptimisticLike } from "./useOptimisticLike";

interface MarketplaceActionsProps {
  session: Session | null;
  images: any[];
  likeMutation: {
    mutate: (params: LikeMutationParams) => void;
    isPending: boolean;
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
  const { optimisticLike } = useOptimisticLike({ likeMutation });

  const handleLike = async (imageId: number) => {
    console.log('🔴 handleLike called for imageId:', imageId);
    
    // Find the image we want
    const allImages = images.flatMap(page => Array.isArray(page) ? page : []);
    const image = allImages.find(img => img.id === imageId);
    
    if (!image) {
      console.log('🔴 Image not found:', imageId);
      return;
    }

    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like images",
        variant: "destructive",
      });
      return;
    }

    const currentHasLiked = Boolean(image.image_likes?.some(like => like.user_id === session.user.id));
    console.log('🔴 Current like status:', { imageId, currentHasLiked, userId: session.user.id });
    
    // Use optimistic update
    await optimisticLike(imageId, currentHasLiked, session.user.id);
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
