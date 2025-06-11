
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageSquare, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
  const { session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('common');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [displayCount, setDisplayCount] = useState(metrics.like || 0);
  
  // Reset animation state when hasLiked changes externally
  useEffect(() => {
    setIsAnimating(false);
  }, [hasLiked]);
  
  // Update displayed count when metrics change
  useEffect(() => {
    if (metrics.like !== undefined) {
      // Animate the count change
      let start = displayCount;
      const end = metrics.like;
      const duration = 500; // ms
      const startTime = performance.now();
      
      // Only animate if there's a difference
      if (start !== end) {
        const animateCount = (timestamp: number) => {
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // If we're counting up or down
          if (start < end) {
            // Counting up
            const current = Math.floor(start + (end - start) * progress);
            setDisplayCount(current);
          } else {
            // Counting down
            const current = Math.ceil(start - (start - end) * progress);
            setDisplayCount(current);
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateCount);
          } else {
            setDisplayCount(end);
          }
        };
        
        requestAnimationFrame(animateCount);
      } else {
        setDisplayCount(end);
      }
    }
  }, [metrics.like]);

  const handleLikeClick = () => {
    if (!session?.user) {
      toast({
        title: t('imageCard.signInRequired'),
        description: t('imageCard.signInToLike'),
        variant: "destructive",
      });
      return;
    }
    
    setIsAnimating(true);
    
    // Only show +1 animation when user is liking (not unliking)
    if (!hasLiked) {
      setShowPlusOne(true);
      setTimeout(() => {
        setShowPlusOne(false);
      }, 1000);
    }
    
    onLike();
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLikeClick}
          className={`transition-colors relative ${hasLiked ? "text-red-500 hover:text-red-400" : "hover:text-primary"}`}
        >
          <Heart 
            className={`h-4 w-4 transition-all duration-300 ${isAnimating ? 'scale-125' : ''} ${hasLiked ? "fill-current" : ""}`} 
            onAnimationEnd={() => setIsAnimating(false)}
          />
          <span className="transition-all duration-200">{displayCount}</span>
          {showPlusOne && (
            <span className="absolute -top-4 right-0 text-green-500 text-xs font-bold animate-fade-up">
              +1
            </span>
          )}
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
        {t('buttons.makeThis')}
      </Button>
    </div>
  );
};
