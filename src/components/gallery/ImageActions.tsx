import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageSquare, Package, Shirt } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { QuickAddToCollection } from "@/components/collections/QuickAddToCollection";
import { VirtualTryOnDialog } from "@/components/tryon/VirtualTryOnDialog";

interface ImageActionsProps {
  imageId: number;
  imageUrl?: string;
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
  imageId,
  imageUrl,
  metrics,
  hasLiked,
  onLike,
  onCommentToggle,
  showComments,
  onMakeClick,
}: ImageActionsProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isLiking, setIsLiking] = useState(false);
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false);

  const handleLikeClick = () => {
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like images",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent double-clicks during processing
    if (isLiking) {
      console.log('🔴 Like operation already in progress, preventing double-click');
      return;
    }
    
    setIsLiking(true);
    
    try {
      onLike();
    } catch (error) {
      console.error('🔴 Like action failed:', error);
      toast({
        title: "Like failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      // Reset after a shorter delay for better responsiveness
      setTimeout(() => {
        setIsLiking(false);
      }, 500);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`transition-colors ${hasLiked ? "text-red-500 hover:text-red-400" : "hover:text-primary"} ${isLiking ? "opacity-50" : ""}`}
        >
          <Heart 
            className={`h-4 w-4 transition-transform hover:scale-105 ${hasLiked ? "fill-current" : ""}`} 
          />
          <span className="font-medium">{metrics.like || 0}</span>
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
        <QuickAddToCollection imageId={imageId} variant="ghost" size="sm" showLabel={false} />
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setTryOnDialogOpen(true)}
          className="gap-2 hover:text-primary"
        >
          <Shirt className="h-4 w-4 transition-transform hover:scale-110" />
        </Button>
        <Button 
          size="sm"
          onClick={onMakeClick}
          className="gap-2 button-glow"
        >
          <Package className="h-4 w-4" />
          Make This
        </Button>
      </div>
      
      {imageUrl && (
        <VirtualTryOnDialog
          open={tryOnDialogOpen}
          onOpenChange={setTryOnDialogOpen}
          generatedImageId={imageId}
          generatedImageUrl={imageUrl}
        />
      )}
    </div>
  );
};
