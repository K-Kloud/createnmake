
import { formatDistanceToNow } from "date-fns";
import { Session } from "@supabase/supabase-js";
import { getFallbackUsername } from "@/utils/usernameUtils";

export const transformImageWithDefaultMetrics = (image: any, session: Session | null) => {
  console.log('🔍 [transformers.ts] Transforming image creator data:', {
    user_id: image.user_id,
    profiles: image.profiles,
    username: image.profiles?.username
  });

  const creatorName = getFallbackUsername(
    image.profiles?.username || null,
    null, // email not available in profiles
    image.user_id,
    image.profiles?.display_name || null,
    image.profiles?.first_name || null,
    image.profiles?.last_name || null
  );

  console.log(`👤 [transformers.ts] Final creator name: "${creatorName}"`);

  return {
    ...image,
    hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
    comments: transformComments(image.comments || []),
    creator: {
      name: creatorName,
      avatar: image.profiles?.avatar_url || 'https://github.com/shadcn.png'
    },
    metrics: {
      like: image.likes || 0,
      comment: (image.comments || []).length,
      view: image.views || 0
    },
    timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true }),
    price: image.price
  };
};

export const transformImageWithMetrics = (image: any, session: Session | null, metricsMap: any) => {
  console.log('🔍 [transformers.ts] Transforming image creator data:', {
    user_id: image.user_id,
    profiles: image.profiles,
    username: image.profiles?.username
  });

  const creatorName = getFallbackUsername(
    image.profiles?.username || null,
    null, // email not available in profiles
    image.user_id,
    image.profiles?.display_name || null,
    image.profiles?.first_name || null,
    image.profiles?.last_name || null
  );

  console.log(`👤 [transformers.ts] Final creator name: "${creatorName}"`);

  return {
    ...image,
    hasLiked: image.image_likes?.some(like => like.user_id === session?.user?.id),
    comments: transformComments(image.comments || []),
    creator: {
      name: creatorName,
      avatar: image.profiles?.avatar_url || 'https://github.com/shadcn.png'
    },
    metrics: metricsMap,
    timeAgo: formatDistanceToNow(new Date(image.created_at), { addSuffix: true }),
    price: image.price
  };
};

export const transformComments = (comments: any[] = []) => {
  console.log(`🔄 [Marketplace transformers.ts] Transforming ${comments.length} comments`);
  
  return comments.map(comment => {
    const createdDate = comment.created_at ? new Date(comment.created_at) : new Date();
    
    // Debug log the raw comment data with more detail
    console.log('🔍 [Marketplace transformers.ts] Raw comment data:', {
      comment_id: comment.id,
      user_id: comment.user_id,
      profiles: comment.profiles,
      profiles_username: comment.profiles?.username,
      profiles_display_name: comment.profiles?.display_name,
      has_profiles: !!comment.profiles
    });
    
    // Since we're using profiles!inner, profiles should always be an object, not array
    const profile = comment.profiles;
    
    // Get the username - prioritize profiles.username from the inner join
    const username = getFallbackUsername(
      profile?.username || null,
      null, // email not available in profiles
      comment.user_id,
      profile?.display_name || null,
      profile?.first_name || null,
      profile?.last_name || null
    );
    
    console.log(`👤 [Marketplace transformers.ts] Final username for comment ${comment.id}: "${username}"`);
    
    return {
      id: comment.id,
      text: comment.text,
      createdAt: createdDate,
      user: {
        id: comment.user_id,
        name: username,
        avatar: profile?.avatar_url || 'https://github.com/shadcn.png'
      },
      replies: (comment.comment_replies || []).map((reply: any) => {
        const replyDate = reply.created_at ? new Date(reply.created_at) : new Date();
        
        console.log('🔍 [Marketplace transformers.ts] Raw reply data:', {
          reply_id: reply.id,
          user_id: reply.user_id,
          profiles: reply.profiles,
          profiles_username: reply.profiles?.username,
          has_profiles: !!reply.profiles
        });
        
        // Since we're using profiles!inner, profiles should always be an object
        const replyProfile = reply.profiles;
        
        const replyUsername = getFallbackUsername(
          replyProfile?.username || null,
          null, // email not available
          reply.user_id,
          replyProfile?.display_name || null,
          replyProfile?.first_name || null,
          replyProfile?.last_name || null
        );
        
        console.log(`👤 [Marketplace transformers.ts] Final username for reply ${reply.id}: "${replyUsername}"`);
        
        return {
          id: reply.id,
          text: reply.text,
          createdAt: replyDate,
          user: {
            id: reply.user_id,
            name: replyUsername,
            avatar: replyProfile?.avatar_url || 'https://github.com/shadcn.png'
          }
        };
      })
    };
  });
};
