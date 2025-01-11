import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageSquare, Package, Share2 } from "lucide-react";

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
}

export const ImageActions = ({
  metrics,
  hasLiked,
  onLike,
  onCommentToggle,
  showComments,
  onMakeClick,
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
        <Button variant="ghost" size="sm" className="space-x-1">
          <Share2 className="h-4 w-4" />
        </Button>
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