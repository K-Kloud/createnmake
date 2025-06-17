
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageSquare, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [displayCount, setDisplayCount] = useState(metrics.like || 0);
  const [prevMetrics, setPrevMetrics] = useState(metrics);
  
  // Reset animation state when hasLiked changes externally
  useEffect(() => {
    setIsAnimating(false);
  }, [hasLiked]);
  
  // Update displayed count when metrics change with smooth animation
  useEffect(() => {
    if (metrics.like !== prevMetrics.like) {
      console.log(`🔴 Like count changed from ${prevMetrics.like} to ${metrics.like}`);
      
      // Animate the count change
      const start = displayCount;
      const end = metrics.like || 0;
      const duration = 300; // ms
      const startTime = performance.now();
      
      // Only animate if there's a difference
      if (start !== end) {
        const animateCount = (timestamp: number) => {
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Use easing for smooth animation
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          if (start < end) {
            // Counting up
            const current = Math.floor(start + (end - start) * easeProgress);
            setDisplayCount(current);
          } else {
            // Counting down
            const current = Math.ceil(start - (start - end) * easeProgress);
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
      
      setPrevMetrics(metrics);
    }
  }, [metrics.like, prevMetrics.like, displayCount]);

  const handleLikeClick = () => {
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like images",
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
          <span className="transition-all duration-200 font-medium">{displayCount}</span>
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
        Make This
      </Button>
    </div>
  );
};
