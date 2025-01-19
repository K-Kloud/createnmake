import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageSquare, Package } from "lucide-react";

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
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={hasLiked ? "text-red-500" : ""}
          aria-label={hasLiked ? "Unlike" : "Like"}
        >
          <Heart 
            className={`h-4 w-4 transition-all duration-200 ${hasLiked ? "fill-current scale-110" : ""}`} 
          />
          <span className="ml-1">{metrics?.like || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentToggle}
          className={showComments ? "text-primary" : ""}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="ml-1">{metrics?.comment || 0}</span>
        </Button>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
          <span className="ml-1">{metrics?.view || 0}</span>
        </Button>
      </div>
      <Button 
        size="sm"
        onClick={onMakeClick}
        className="gap-2"
      >
        <Package className="h-4 w-4" />
        Make This
      </Button>
    </div>
  );
};