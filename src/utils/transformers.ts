
import { GalleryImage, Comment, Reply } from "@/types/gallery";
import { formatDistanceToNow } from "date-fns";
import { getFallbackUsername } from "@/utils/usernameUtils";

export const transformComments = (comments: any[]): Comment[] => {
  return comments.map(comment => ({
    id: comment.id,
    text: comment.text,
    user: {
      id: comment.user_id,
      name: getFallbackUsername(
        comment.profiles?.username,
        comment.profiles?.email || comment.user_metadata?.email,
        comment.user_id
      ),
      avatar: comment.profiles?.avatar_url || '/placeholder.svg'
    },
    createdAt: new Date(comment.created_at || Date.now()),
    replies: comment.comment_replies?.map((reply: any): Reply => ({
      id: reply.id,
      text: reply.text,
      user: {
        id: reply.user_id,
        name: getFallbackUsername(
          reply.profiles?.username,
          reply.profiles?.email || reply.user_metadata?.email,
          reply.user_id
        ),
        avatar: reply.profiles?.avatar_url || '/placeholder.svg'
      },
      createdAt: new Date(reply.created_at || Date.now())
    })) || []
  }));
};

export const transformImage = (image: any, userId?: string): GalleryImage => {
  const createdAt = new Date(image.created_at || Date.now());
  
  return {
    id: image.id,
    url: image.image_url || '',
    prompt: image.prompt,
    likes: image.likes || 0,
    views: image.views || 0,
    comments: transformComments(image.comments || []),
    produced: 0,
    creator: {
      name: getFallbackUsername(
        image.profiles?.username,
        image.profiles?.email || image.user_metadata?.email,
        image.user_id
      ),
      avatar: image.profiles?.avatar_url || '/placeholder.svg'
    },
    createdAt,
    timeAgo: formatDistanceToNow(createdAt, { addSuffix: true }),
    hasLiked: Boolean(image.image_likes?.some((like: any) => like.user_id === userId)),
    image_likes: image.image_likes || [],
    metrics: {
      like: image.likes || 0,
      comment: (image.comments || []).length,
      view: image.views || 0
    },
    user_id: image.user_id || ''
  };
};
