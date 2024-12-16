export interface GalleryImage {
  id: number;
  url: string;
  prompt: string;
  likes: number;
  comments: Comment[];
  views: number;
  produced: number;
  creator: {
    name: string;
    avatar: string;
  };
  createdAt: Date;
  hasLiked: boolean;
  image_likes: ImageLike[];
}

export interface ImageLike {
  user_id: string;
}

export interface Comment {
  id: number;
  text: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  replies?: Reply[];
}

export interface Reply {
  id: number;
  text: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
}

export interface LikeMutationParams {
  imageId: number;
  hasLiked: boolean;
  userId: string;
}

export interface CommentMutationParams {
  imageId: number;
  text: string;
  userId: string;
}

export interface ReplyMutationParams {
  commentId: number;
  text: string;
  userId: string;
}