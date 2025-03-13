
import { formatDistanceToNow } from "date-fns";
import { Session } from "@supabase/supabase-js";

export const transformImageWithDefaultMetrics = (image: any, session: Session | null) => ({
  ...image,
  hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
  comments: transformComments(image.comments || []),
  metrics: {
    like: image.likes || 0,
    comment: (image.comments || []).length,
    view: image.views || 0
  },
  timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true }),
  price: image.price
});

export const transformImageWithMetrics = (image: any, session: Session | null, metricsMap: any) => ({
  ...image,
  hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
  comments: transformComments(image.comments || []),
  metrics: metricsMap,
  timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true }),
  price: image.price
});

export const transformComments = (comments: any[] = []) => {
  return comments.map(comment => ({
    id: comment.id,
    text: comment.text,
    createdAt: new Date(comment.created_at),
    user: {
      id: comment.user_id,
      name: comment.profiles?.username || 'Anonymous',
      avatar: comment.profiles?.avatar_url || 'https://github.com/shadcn.png'
    },
    replies: comment.comment_replies?.map((reply: any) => ({
      id: reply.id,
      text: reply.text,
      createdAt: new Date(reply.created_at),
      user: {
        id: reply.user_id,
        name: reply.profiles?.username || 'Anonymous',
        avatar: reply.profiles?.avatar_url || 'https://github.com/shadcn.png'
      }
    })) || []
  })) || [];
};
