
import { formatDistanceToNow } from "date-fns";
import { Session } from "@supabase/supabase-js";
import { isValid, parseISO } from "date-fns";

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
  return comments.map(comment => {
    const createdDate = comment.created_at ? new Date(comment.created_at) : new Date();
    
    return {
      id: comment.id,
      text: comment.text,
      createdAt: createdDate,
      user: {
        id: comment.user_id,
        name: comment.profiles?.username || 'Anonymous User',
        avatar: comment.profiles?.avatar_url || 'https://github.com/shadcn.png'
      },
      replies: (comment.comment_replies || []).map((reply: any) => {
        const replyDate = reply.created_at ? new Date(reply.created_at) : new Date();
        
        return {
          id: reply.id,
          text: reply.text,
          createdAt: replyDate,
          user: {
            id: reply.user_id,
            name: reply.profiles?.username || 'Anonymous User',
            avatar: reply.profiles?.avatar_url || 'https://github.com/shadcn.png'
          }
        };
      })
    };
  });
};
