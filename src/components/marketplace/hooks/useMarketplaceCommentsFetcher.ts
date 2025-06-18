
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
        avatar_url
      )
    `)
    .eq('image_id', imageId);

  if (commentsError) {
    console.error(`❌ Error fetching comments for image ${imageId}:`, commentsError);
    return [];
  }

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
        avatar_url
      )
    `)
    .eq('comment_id', commentId);

  if (repliesError) {
    console.error(`❌ Error fetching replies for comment ${commentId}:`, repliesError);
    return [];
  }

  return replies || [];
};

export const fetchCommentsWithReplies = async (comments: any[]) => {
  return await Promise.all(
    comments.map(async (comment) => {
      const replies = await fetchCommentReplies(comment.id);
      console.log(`👤 Comment user profile:`, comment.profiles, `Username: ${comment.profiles?.username}`);
      return { ...comment, comment_replies: replies };
    })
  );
};
