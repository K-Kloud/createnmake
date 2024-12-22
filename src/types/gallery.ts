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
  aspect_ratio?: string;
  image_url?: string;
  is_public?: boolean;
  item_type?: string;
  reference_image_url?: string;
  status?: string;
  tags?: string[];
  title?: string;
  user_id?: string;
  metrics?: {
    like?: number;
    comment?: number;
    view?: number;
  };
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
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