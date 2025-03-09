
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
          className={`transition-colors ${hasLiked ? "text-red-500 hover:text-red-400" : "hover:text-primary"}`}
        >
          <Heart className={`h-4 w-4 transition-transform hover:scale-110 ${hasLiked ? "fill-current" : ""}`} />
          <span>{metrics.like || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentToggle}
          className={`transition-colors ${showComments ? "text-primary hover:text-primary/80" : "hover:text-primary"}`}
        >
          <MessageSquare className="h-4 w-4 transition-transform hover:scale-110" />
          <span>{metrics.comment || 0}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="hover:text-primary"
        >
          <Eye className="h-4 w-4 transition-transform hover:scale-110" />
          <span>{metrics.view || 0}</span>
        </Button>
      </div>
      <Button 
        size="sm"
        onClick={onMakeClick}
        className="gap-2 button-glow"
      >
        <Package className="h-4 w-4" />
        Make This
      </Button>
    </div>
  );
};
