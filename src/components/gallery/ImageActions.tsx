import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageSquare, Package } from "lucide-react";
import { ShareButton } from "./ShareButton";

interface ImageActionsProps {
  metrics: {
    like: number;
    comment: number;
    view: number;
  };
  hasLiked: boolean;
  onLike: () => void;
  onCommentToggle: () => void;
  showComments: boolean;
  onMakeClick: () => void;
  imageUrl?: string;
  imageId?: number;
  creator: {
    name: string;
  };
}

export const ImageActions = ({
  metrics,
  hasLiked,
  onLike,
  onCommentToggle,
  showComments,
  onMakeClick,
  imageUrl,
  imageId,
  creator,
}: ImageActionsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-4">
        <Button 
          variant={hasLiked ? "default" : "ghost"} 
          size="sm" 
          className="space-x-1"
          onClick={onLike}
        >
          <Heart 
            className={`h-4 w-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} 
          />
          <span>{metrics.like || 0}</span>
        </Button>
        <Button 
          variant={showComments ? "default" : "ghost"} 
          size="sm" 
          className="space-x-1"
          onClick={onCommentToggle}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{metrics.comment || 0}</span>
        </Button>
        <Button variant="ghost" size="sm" className="space-x-1">
          <Eye className="h-4 w-4" />
          <span>{metrics.view || 0}</span>
        </Button>
        <ShareButton 
          creator={creator}
          imageUrl={imageUrl}
          imageId={imageId}
        />
      </div>
      <Button 
        size="sm" 
        className="space-x-1"
        onClick={onMakeClick}
      >
        <Package className="h-4 w-4" />
        <span>Make</span>
      </Button>
    </div>
  );
};