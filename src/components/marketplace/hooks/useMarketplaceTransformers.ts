
import { formatDistanceToNow } from "date-fns";
import { Session } from "@supabase/supabase-js";
import { getFallbackUsername } from "@/utils/usernameUtils";

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
  console.log(`🔄 Transforming ${comments.length} comments`);
  
  return comments.map(comment => {
    const createdDate = comment.created_at ? new Date(comment.created_at) : new Date();
    
    // Debug log the raw comment data
    console.log('🔍 Raw comment data:', {
      user_id: comment.user_id,
      profiles: comment.profiles,
      username: comment.profiles?.username
    });
    
    // Get the username using our improved fallback logic
    const username = getFallbackUsername(
      comment.profiles?.username || null,
      comment.profiles?.email || null, // This might be null since email isn't in profiles
      comment.user_id
    );
    
    console.log(`👤 Final username for comment: "${username}"`);
    
    return {
      id: comment.id,
      text: comment.text,
      createdAt: createdDate,
      user: {
        id: comment.user_id,
        name: username,
        avatar: comment.profiles?.avatar_url || 'https://github.com/shadcn.png'
      },
      replies: (comment.comment_replies || []).map((reply: any) => {
        const replyDate = reply.created_at ? new Date(reply.created_at) : new Date();
        
        console.log('🔍 Raw reply data:', {
          user_id: reply.user_id,
          profiles: reply.profiles,
          username: reply.profiles?.username
        });
        
        const replyUsername = getFallbackUsername(
          reply.profiles?.username || null,
          reply.profiles?.email || null,
          reply.user_id
        );
        
        console.log(`👤 Final username for reply: "${replyUsername}"`);
        
        return {
          id: reply.id,
          text: reply.text,
          createdAt: replyDate,
          user: {
            id: reply.user_id,
            name: replyUsername,
            avatar: reply.profiles?.avatar_url || 'https://github.com/shadcn.png'
          }
        };
      })
    };
  });
};
