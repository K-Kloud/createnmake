import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Eye, Share2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImagePermissions } from "./image-preview/useImagePermissions";
import { useImageDeletion } from "./image-preview/useImageDeletion";
import { useToast } from "@/hooks/use-toast";

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
    user_id: string;
  };
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onClick: () => void;
  onImageDeleted?: (id: number) => void;
}

export const MasonryImageCard = ({ 
  image, 
  onLike,
  onView,
  onClick,
  onImageDeleted
}: MasonryImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  
  // Permission and deletion hooks
  const { canDelete } = useImagePermissions(image.user_id);
  const { isDeleting, handleDelete: performDelete } = useImageDeletion(() => {
    if (onImageDeleted) {
      onImageDeleted(image.id);
    }
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(image.id);
  };

  const handleClick = () => {
    onView(image.id);
    onClick();
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    await performDelete(image.id, image.user_id, canDelete);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + `/gallery/${image.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard",
    });
  };

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer rounded-2xl border-0 shadow-none transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden rounded-2xl">
        <img 
          src={image.url} 
          alt={image.prompt}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 backdrop-blur-sm transition-all duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          {/* Creator Info - Top */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-white/30 ring-2 ring-white/10">
                <AvatarImage src={image.creator.avatar} alt={image.creator.name} />
                <AvatarFallback className="bg-primary/20 text-white text-xs">{image.creator.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p className="text-sm font-semibold tracking-tight">{image.creator.name}</p>
                <p className="text-xs text-white/60 font-medium">{image.timeAgo}</p>
              </div>
            </div>
          </div>

          {/* Actions - Bottom */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-3 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300",
                  image.hasLiked && "bg-red-500/20 border-red-400/40 text-red-300"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("h-4 w-4 transition-all", image.hasLiked && "fill-current scale-110")} />
                <span className="ml-1.5 text-xs font-medium">{image.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="ml-1.5 text-xs font-medium">{image.comments.length}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
              >
                <Eye className="h-4 w-4" />
                <span className="ml-1.5 text-xs font-medium">{image.views}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="h-9 w-9 rounded-full backdrop-blur-md bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-300 transition-all duration-300 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Prompt - Middle (truncated) */}
          <div className="absolute bottom-16 left-4 right-4">
            <p className="text-white text-sm line-clamp-2 font-medium tracking-tight leading-relaxed">{image.prompt}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
