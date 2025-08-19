// Enhanced gallery types with strict typing
export interface GalleryUser {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: number;
  text: string;
  user: GalleryUser;
  createdAt: Date;
  replies?: Reply[];
}

export interface Reply {
  id: number;
  text: string;
  user: GalleryUser;
  createdAt: Date;
}

export interface ImageMetrics {
  like: number;
  comment: number;
  view: number;
}

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
  timeAgo: string;
  hasLiked: boolean;
  image_likes: ImageLike[];
  metrics: ImageMetrics;
  user_id: string;
  price?: string;
  title?: string;
  item_type?: string;
}

export interface ImageLike {
  user_id: string;
}

export interface GalleryFilters {
  category?: string;
  sort?: 'newest' | 'oldest' | 'most_liked' | 'most_viewed';
  timeRange?: 'day' | 'week' | 'month' | 'all';
  itemType?: string;
}

export interface GalleryState {
  images: GalleryImage[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  filters: GalleryFilters;
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
