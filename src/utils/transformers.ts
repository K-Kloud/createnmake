
import { GalleryImage, Comment, Reply } from "@/types/gallery";
import { formatDistanceToNow } from "date-fns";
import { getFallbackUsername } from "@/utils/usernameUtils";

export const transformComments = (comments: any[]): Comment[] => {
  console.log(`🔄 [transformers.ts] Transforming ${comments.length} comments`);
  
  return comments.map(comment => {
    console.log('🔍 [transformers.ts] Raw comment data:', {
      user_id: comment.user_id,
      profiles: comment.profiles,
      username: comment.profiles?.username
    });
    
    const username = getFallbackUsername(
      comment.profiles?.username || null,
      comment.profiles?.email || null,
      comment.user_id,
      comment.profiles?.display_name || null,
      comment.profiles?.first_name || null,
      comment.profiles?.last_name || null
    );
    
    console.log(`👤 [transformers.ts] Final username for comment: "${username}"`);
    
    return {
      id: comment.id,
      text: comment.text || '',
      user: {
        id: comment.user_id,
        name: username,
        avatar: comment.profiles?.avatar_url || '/placeholder.svg'
      },
      createdAt: new Date(comment.created_at || Date.now()),
      replies: comment.comment_replies?.map((reply: any): Reply => {
        console.log('🔍 [transformers.ts] Raw reply data:', {
          user_id: reply.user_id,
          profiles: reply.profiles,
          username: reply.profiles?.username
        });
        
        const replyUsername = getFallbackUsername(
          reply.profiles?.username || null,
          reply.profiles?.email || null,
          reply.user_id,
          reply.profiles?.display_name || null,
          reply.profiles?.first_name || null,
          reply.profiles?.last_name || null
        );
        
        console.log(`👤 [transformers.ts] Final username for reply: "${replyUsername}"`);
        
        return {
          id: reply.id,
          text: reply.text || '',
          user: {
            id: reply.user_id,
            name: replyUsername,
            avatar: reply.profiles?.avatar_url || '/placeholder.svg'
          },
          createdAt: new Date(reply.created_at || Date.now())
        };
      }) || []
    };
  });
};

export const transformImage = (image: any, userId?: string): GalleryImage => {
  const createdAt = new Date(image.created_at || Date.now());
  
  console.log('🔍 [transformers.ts] Transforming image creator data:', {
    user_id: image.user_id,
    profiles: image.profiles,
    username: image.profiles?.username
  });
  
  const creatorName = getFallbackUsername(
    image.profiles?.username || null,
    image.profiles?.email || null,
    image.user_id,
    image.profiles?.display_name || null,
    image.profiles?.first_name || null,
    image.profiles?.last_name || null
  );
  
  console.log(`👤 [transformers.ts] Final creator name: "${creatorName}"`);
  
  return {
    id: image.id,
    url: image.image_url || '',
    prompt: image.prompt || 'No prompt available',
    likes: image.likes || 0,
    views: image.views || 0,
    comments: transformComments(image.comments || []),
    produced: 0,
    creator: {
      name: creatorName,
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
    user_id: image.user_id || '',
    price: image.price || undefined
  };
};
