import { GalleryImage, Comment, Reply } from "@/types/gallery";

export const transformComments = (comments: any[]): Comment[] => {
  return comments.map(comment => ({
    id: comment.id,
    text: comment.text,
    user: {
      id: comment.user_id,
      name: comment.profiles?.username || 'Anonymous',
      avatar: comment.profiles?.avatar_url || '/placeholder.svg'
    },
    createdAt: new Date(comment.created_at),
    replies: comment.comment_replies?.map((reply: any): Reply => ({
      id: reply.id,
      text: reply.text,
      user: {
        id: reply.user_id,
        name: reply.profiles?.username || 'Anonymous',
        avatar: reply.profiles?.avatar_url || '/placeholder.svg'
      },
      createdAt: new Date(reply.created_at)
    })) || []
  }));
};

export const transformImage = (image: any, userId?: string): GalleryImage => ({
  id: image.id,
  url: image.image_url || '',
  prompt: image.prompt,
  likes: image.likes || 0,
  views: image.views || 0,
  comments: transformComments(image.comments || []),
  produced: 0,
  creator: {
    name: image.profiles?.username || 'Anonymous',
    avatar: image.profiles?.avatar_url || '/placeholder.svg'
  },
  createdAt: new Date(image.created_at),
  hasLiked: Boolean(image.image_likes?.some((like: any) => like.user_id === userId)),
  image_likes: image.image_likes || [],
  metrics: {
    like: image.likes || 0,
    comment: (image.comments || []).length,
    view: image.views || 0
  }
});