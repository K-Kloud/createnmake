import { supabase } from "@/integrations/supabase/client";

// Batch fetch comments for multiple images
export const fetchBatchImageComments = async (imageIds: number[]) => {
  if (imageIds.length === 0) return {};

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      text,
      created_at,
      user_id,
      image_id,
      profiles!inner (
        id, 
        username,
        display_name,
        avatar_url
      )
    `)
    .in('image_id', imageIds);

  if (commentsError) {
    console.error(`❌ Error fetching batch comments:`, commentsError);
    return {};
  }

  // Group comments by image_id
  const commentsByImage = (comments || []).reduce((acc, comment) => {
    if (!acc[comment.image_id]) {
      acc[comment.image_id] = [];
    }
    acc[comment.image_id].push(comment);
    return acc;
  }, {} as Record<number, any[]>);

  console.log(`📝 Fetched ${comments?.length || 0} comments for ${imageIds.length} images`);
  return commentsByImage;
};

export const fetchImageComments = async (imageId: number) => {
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      text,
      created_at,
      user_id,
      profiles!inner (
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
      profiles!inner (
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

// Batch fetch replies for multiple comments
export const fetchBatchCommentReplies = async (commentIds: number[]) => {
  if (commentIds.length === 0) return {};

  const { data: replies, error: repliesError } = await supabase
    .from('comment_replies')
    .select(`
      id,
      text,
      created_at,
      user_id,
      comment_id,
      profiles!inner (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .in('comment_id', commentIds);

  if (repliesError) {
    console.error(`❌ Error fetching batch replies:`, repliesError);
    return {};
  }

  // Group replies by comment_id
  const repliesByComment = (replies || []).reduce((acc, reply) => {
    if (!acc[reply.comment_id]) {
      acc[reply.comment_id] = [];
    }
    acc[reply.comment_id].push(reply);
    return acc;
  }, {} as Record<number, any[]>);

  console.log(`💬 Fetched ${replies?.length || 0} replies for ${commentIds.length} comments`);
  return repliesByComment;
};

export const fetchCommentsWithReplies = async (comments: any[]) => {
  if (comments.length === 0) return [];

  // Batch fetch all replies
  const commentIds = comments.map(c => c.id);
  const repliesByComment = await fetchBatchCommentReplies(commentIds);

  return comments.map(comment => ({
    ...comment,
    comment_replies: repliesByComment[comment.id] || []
  }));
};