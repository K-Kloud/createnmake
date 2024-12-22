import { GalleryImage } from '@/types/gallery';

export const currentUser = {
  id: "user1",
  name: "John Doe",
  avatar: "https://github.com/shadcn.png"
};

export const initialImages: GalleryImage[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    prompt: "A woman sitting on a bed using a laptop",
    likes: 234,
    comments: [],
    views: 1289,
    produced: 67,
    creator: {
      name: "Alice Johnson",
      avatar: "https://github.com/shadcn.png"
    },
    createdAt: new Date(2024, 2, 15, 14, 30),
    hasLiked: false,
    image_likes: [],
    metrics: {
      like: 234,
      comment: 0,
      view: 1289
    }
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    prompt: "Turned on gray laptop computer",
    likes: 189,
    comments: [],
    views: 876,
    produced: 34,
    creator: {
      name: "Bob Smith",
      avatar: "https://github.com/shadcn.png"
    },
    createdAt: new Date(2024, 2, 14, 9, 15),
    hasLiked: false,
    image_likes: [],
    metrics: {
      like: 189,
      comment: 0,
      view: 876
    }
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    prompt: "Macro photography of black circuit board",
    likes: 567,
    comments: [],
    views: 2345,
    produced: 156,
    creator: {
      name: "Charlie Brown",
      avatar: "https://github.com/shadcn.png"
    },
    createdAt: new Date(2024, 2, 13, 11, 0),
    hasLiked: false,
    image_likes: [],
    metrics: {
      like: 567,
      comment: 0,
      view: 2345
    }
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    prompt: "Monitor showing Java programming",
    likes: 432,
    comments: [],
    views: 1567,
    produced: 89,
    creator: {
      name: "Diana Prince",
      avatar: "https://github.com/shadcn.png"
    },
    createdAt: new Date(2024, 2, 12, 16, 45),
    hasLiked: false,
    image_likes: [],
    metrics: {
      like: 432,
      comment: 0,
      view: 1567
    }
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    prompt: "Person using MacBook Pro",
    likes: 345,
    comments: [],
    views: 1789,
    produced: 45,
    creator: {
      name: "Ethan Hunt",
      avatar: "https://github.com/shadcn.png"
    },
    createdAt: new Date(2024, 2, 11, 8, 30),
    hasLiked: false,
    image_likes: [],
    metrics: {
      like: 345,
      comment: 0,
      view: 1789
    }
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    prompt: "Woman in white long sleeve shirt using black laptop computer",
    likes: 678,
    comments: [],
    views: 3456,
    produced: 234,
    creator: {
      name: "Fiona Gallagher",
      avatar: "https://github.com/shadcn.png"
    },
    createdAt: new Date(2024, 2, 10, 12, 15),
    hasLiked: false,
    image_likes: [],
    metrics: {
      like: 678,
      comment: 0,
      view: 3456
    }
  },
];