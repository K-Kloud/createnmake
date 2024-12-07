import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Eye, Package } from "lucide-react";
import { Footer } from "@/components/Footer";

const images = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    prompt: "A woman sitting on a bed using a laptop",
    likes: 234,
    comments: 45,
    views: 1289,
    produced: 67,
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    prompt: "Turned on gray laptop computer",
    likes: 189,
    comments: 23,
    views: 876,
    produced: 34,
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    prompt: "Macro photography of black circuit board",
    likes: 567,
    comments: 89,
    views: 2345,
    produced: 156,
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    prompt: "Monitor showing Java programming",
    likes: 432,
    comments: 67,
    views: 1567,
    produced: 89,
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    prompt: "Person using MacBook Pro",
    likes: 345,
    comments: 56,
    views: 1789,
    produced: 45,
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    prompt: "Woman in white long sleeve shirt using black laptop computer",
    likes: 678,
    comments: 98,
    views: 3456,
    produced: 234,
  },
];

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Image Gallery</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden glass-card hover:scale-[1.02] transition-transform">
              <CardContent className="p-0">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-300">{image.prompt}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Button variant="ghost" size="sm" className="space-x-1">
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