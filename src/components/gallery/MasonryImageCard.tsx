import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Eye, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MasonryImageCardProps {
  image: {
    id: number;
    url: string;
    prompt: string;
    likes: number;
    comments: any[];
    views: number;
    creator: {
      name: string;
      avatar: string;
    };
    timeAgo: string;
    hasLiked: boolean;
  };
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onClick: () => void;
}

export const MasonryImageCard = ({ 
  image, 
  onLike,
  onView,
  onClick
}: MasonryImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(image.id);
  };

  const handleClick = () => {
    onView(image.id);
    onClick();
  };

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative w-full">
        <img 
          src={image.url} 
          alt={image.prompt}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          {/* Creator Info - Top */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white/20">
                <AvatarImage src={image.creator.avatar} alt={image.creator.name} />
                <AvatarFallback>{image.creator.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p className="text-sm font-medium">{image.creator.name}</p>
                <p className="text-xs text-white/70">{image.timeAgo}</p>
              </div>
            </div>
          </div>

          {/* Actions - Bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-white hover:text-red-500 hover:bg-white/10 transition-colors",
                  image.hasLiked && "text-red-500"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("h-4 w-4", image.hasLiked && "fill-current")} />
                <span className="ml-1 text-xs">{image.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="ml-1 text-xs">{image.comments.length}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Eye className="h-4 w-4" />
                <span className="ml-1 text-xs">{image.views}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Prompt - Middle (truncated) */}
          <div className="absolute bottom-16 left-3 right-3">
            <p className="text-white/90 text-xs line-clamp-2">{image.prompt}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
