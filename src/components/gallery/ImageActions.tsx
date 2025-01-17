import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageSquare, Package } from "lucide-react";

interface ImageActionsProps {
  metrics: {
    like: number;
    comment: number;
    view: number;
  };
  hasLiked: boolean;
  onLike: () => void;  // Changed from onLikeToggle to onLike
  onCommentToggle: () => void;
  showComments: boolean;
  onMakeClick: () => void;
}

export const ImageActions = ({
  metrics,
  hasLiked,
  onLike,  // Changed from onLikeToggle to onLike
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
          onClick={onLike}  // Changed from onLikeToggle to onLike
          className={hasLiked ? "text-red-500" : ""}
        >
          <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
          <span>{metrics.like || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentToggle}
          className={showComments ? "text-primary" : ""}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{metrics.comment || 0}</span>
        </Button>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
          <span>{metrics.view || 0}</span>
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