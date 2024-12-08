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