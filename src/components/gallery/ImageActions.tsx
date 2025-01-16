import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Eye, Share2 } from "lucide-react";
import { ShareButton } from "./ShareButton";

interface Metrics {
  like: number;
  comment: number;
  view: number;
}

interface ImageActionsProps {
  metrics: Metrics;
  hasLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  imageId: string | number;
}

export const ImageActions = ({ metrics, hasLiked, onLike, onComment, imageId }: ImageActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className={`${hasLiked ? 'text-red-500' : ''} space-x-1`}
          onClick={onLike}
        >
          <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{metrics.like}</span>
        </Button>
        <Button variant="ghost" size="sm" className="space-x-1" onClick={onComment}>
          <MessageCircle className="h-4 w-4" />
          <span>{metrics.comment}</span>
        </Button>
        <Button variant="ghost" size="sm" className="space-x-1" disabled>
          <Eye className="h-4 w-4" />
          <span>{metrics.view}</span>
        </Button>
      </div>
      <ShareButton imageId={imageId}>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </ShareButton>
    </div>
  );
};