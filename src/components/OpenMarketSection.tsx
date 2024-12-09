import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ImageCard } from "@/components/gallery/ImageCard";

const featuredImages = [
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
  }
];

export const OpenMarketSection = () => {
  const navigate = useNavigate();

  const handleLike = (imageId: number) => {
    // Placeholder for like functionality
    console.log('Like clicked for image:', imageId);
  };

  const handleView = (imageId: number) => {
    // Placeholder for view functionality
    console.log('View clicked for image:', imageId);
  };

  const handleAddComment = (imageId: number, commentText: string) => {
    // Placeholder for comment functionality
    console.log('Comment added to image:', imageId, commentText);
  };

  const handleAddReply = (imageId: number, commentId: number, replyText: string) => {
    // Placeholder for reply functionality
    console.log('Reply added to comment:', commentId, replyText);
  };

  return (
    <section className="py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold gradient-text rounded-lg">OpenMarket</h2>
        <Button 
          onClick={() => navigate("/marketplace")}
          variant="outline"
        >
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredImages.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onLike={handleLike}
            onView={handleView}
            onAddComment={handleAddComment}
            onAddReply={handleAddReply}
          />
        ))}
      </div>
    </section>
  );
};
