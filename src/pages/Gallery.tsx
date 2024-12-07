import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageCard } from "@/components/gallery/ImageCard";

// Mock user data - in a real app this would come from auth
const currentUser = {
  id: "user1",
  name: "John Doe",
  avatar: "https://github.com/shadcn.png"
};

const initialImages = [
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
    hasLiked: false
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
    hasLiked: false
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
    hasLiked: false
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
    hasLiked: false
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
    hasLiked: false
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
    hasLiked: false
  },
];

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState(initialImages.map(img => ({
    ...img,
    comments: []
  })));

  const handleLike = (imageId: number) => {
    setGalleryImages(prevImages =>
      prevImages.map(image => {
        if (image.id === imageId) {
          return {
            ...image,
            likes: image.hasLiked ? image.likes - 1 : image.likes + 1,
            hasLiked: !image.hasLiked
          };
        }
        return image;
      })
    );
  };

  const handleView = (imageId: number) => {
    setGalleryImages(prevImages =>
      prevImages.map(image => {
        if (image.id === imageId) {
          return {
            ...image,
            views: image.views + 1
          };
        }
        return image;
      })
    );
  };

  const handleAddComment = (imageId: number, commentText: string) => {
    setGalleryImages(prevImages =>
      prevImages.map(image => {
        if (image.id === imageId) {
          const newComment = {
            id: Date.now(),
            text: commentText,
            user: currentUser,
            createdAt: new Date()
          };
          return {
            ...image,
            comments: [...image.comments, newComment]
          };
        }
        return image;
      })
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Image Gallery</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onLike={handleLike}
              onView={handleView}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;
