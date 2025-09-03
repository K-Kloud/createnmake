import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { useProviderMetrics } from "@/hooks/useProviderMetrics";
import { useToast } from "@/hooks/use-toast";

interface ImageRatingProps {
  imageId?: number;
  provider: string;
  onRatingSubmit?: (rating: number) => void;
  className?: string;
}

export const ImageRating = ({ 
  imageId, 
  provider, 
  onRatingSubmit,
  className = "" 
}: ImageRatingProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const { recordUserSatisfaction, recordQualityScore } = useProviderMetrics();
  const { toast } = useToast();

  const handleStarRating = (starRating: number) => {
    setRating(starRating);
    handleSubmitRating(starRating);
  };

  const handleThumbsRating = (isPositive: boolean) => {
    const thumbsRating = isPositive ? 4 : 2; // Convert to 1-5 scale
    setRating(thumbsRating);
    handleSubmitRating(thumbsRating);
  };

  const handleSubmitRating = (ratingValue: number) => {
    if (hasRated) return;

    // Record metrics
    recordUserSatisfaction(provider, ratingValue, imageId);
    recordQualityScore(provider, ratingValue / 5, imageId); // Normalize to 0-1 scale

    setHasRated(true);
    onRatingSubmit?.(ratingValue);

    toast({
      title: "Rating submitted",
      description: "Thank you for your feedback! This helps improve our recommendations.",
    });
  };

  if (hasRated) {
    return (
      <Card className={`${className} bg-green-500/10 border-green-500/30`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm font-medium">Thank you for rating!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-accent/30 border-accent`}>
      <CardContent className="p-3">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-foreground">
            Rate this image
          </p>
          <p className="text-xs text-muted-foreground">
            Help us improve {provider === 'openai' ? 'GPT-Image-1' : provider === 'gemini' ? 'Gemini' : 'Grok'} recommendations
          </p>
          
          {/* Star Rating */}
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <TooltipProvider key={star}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto hover:bg-accent"
                      onClick={() => handleStarRating(star)}
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${
                          rating && star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground hover:text-yellow-400'
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{star === 1 ? 'Poor' : star === 2 ? 'Fair' : star === 3 ? 'Good' : star === 4 ? 'Great' : 'Excellent'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          {/* Quick Thumbs Rating */}
          <div className="flex justify-center space-x-3 pt-2 border-t border-accent">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleThumbsRating(true)}
                    className="px-3 py-1 hover:bg-green-500/10 hover:border-green-500/30"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Good
                  </Button>
                </TooltipTrigger>
                <TooltipContent>This image meets my expectations</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleThumbsRating(false)}
                    className="px-3 py-1 hover:bg-red-500/10 hover:border-red-500/30"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Poor
                  </Button>
                </TooltipTrigger>
                <TooltipContent>This image needs improvement</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};