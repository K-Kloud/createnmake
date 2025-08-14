import { supabase } from "@/integrations/supabase/client";

export const fetchImageComments = async (imageId: number) => {
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      text,
      created_at,
      user_id,
      profiles (
        id, 
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('image_id', imageId);

  if (commentsError) {
    console.error(`❌ Error fetching comments for image ${imageId}:`, commentsError);
    return [];
  }

  console.log(`📝 Fetched ${comments?.length || 0} comments for image ${imageId}`);
  
  // Add debug logging for each comment's user data
  comments?.forEach((comment, index) => {
    console.log(`👤 Comment ${index + 1} user data:`, {
      user_id: comment.user_id,
      profiles: comment.profiles,
      username: Array.isArray(comment.profiles) ? (comment.profiles[0] as any)?.username : (comment.profiles as any)?.username
    });
  });

  return comments || [];
};

export const fetchCommentReplies = async (commentId: number) => {
  const { data: replies, error: repliesError } = await supabase
    .from('comment_replies')
    .select(`
      id,
      text,
      created_at,
      user_id,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('comment_id', commentId);

  if (repliesError) {
    console.error(`❌ Error fetching replies for comment ${commentId}:`, repliesError);
    return [];
  }

  console.log(`💬 Fetched ${replies?.length || 0} replies for comment ${commentId}`);
  
  // Add debug logging for each reply's user data
  replies?.forEach((reply, index) => {
    console.log(`👤 Reply ${index + 1} user data:`, {
      user_id: reply.user_id,
      profiles: reply.profiles,
      username: Array.isArray(reply.profiles) ? (reply.profiles[0] as any)?.username : (reply.profiles as any)?.username
    });
  });

  return replies || [];
};

export const fetchCommentsWithReplies = async (comments: any[]) => {
  return await Promise.all(
    comments.map(async (comment) => {
      const replies = await fetchCommentReplies(comment.id);
      console.log(`👤 Processing comment from user:`, {
        user_id: comment.user_id,
        profiles: comment.profiles,
        username: Array.isArray(comment.profiles) ? (comment.profiles[0] as any)?.username : (comment.profiles as any)?.username
      });
      return { ...comment, comment_replies: replies };
    })
  );
};