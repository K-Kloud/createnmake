import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Eye, Package } from "lucide-react";
import { Footer } from "@/components/Footer";
import { formatDistanceToNow } from "date-fns";

// Mock user data - in a real app this would come from auth
const currentUser = {
  id: "user1",
  name: "John Doe",
  avatar: "https://github.com/shadcn.png"
};

const images = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    prompt: "A woman sitting on a bed using a laptop",
    likes: 234,
    comments: 45,
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
    comments: 23,
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
    comments: 89,
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
    comments: 67,
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
    comments: 56,
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
    comments: 98,
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
  const [galleryImages, setGalleryImages] = useState(images);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Image Gallery</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <Card key={image.id} className="overflow-hidden glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-64 object-cover"
                  onClick={() => handleView(image.id)}
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={image.creator.avatar}
                      alt={image.creator.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium">{image.creator.name}</span>
                    <span className="text-sm text-gray-400">
                      {formatDistanceToNow(image.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{image.prompt}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Button 
                        variant={image.hasLiked ? "default" : "ghost"} 
                        size="sm" 
                        className="space-x-1"
                        onClick={() => handleLike(image.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{image.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{image.comments}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{image.views}</span>
                      </Button>
                    </div>
                    <Button size="sm" className="space-x-1">
                      <Package className="h-4 w-4" />
                      <span>{image.produced}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;
