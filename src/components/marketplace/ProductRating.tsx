import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductRatingProps {
  rating: number;
  reviewCount: number;
  className?: string;
  showCount?: boolean;
}

export const ProductRating = ({ 
  rating, 
  reviewCount, 
  className,
  showCount = true 
}: ProductRatingProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3 h-3",
              i < Math.floor(rating) 
                ? "fill-[hsl(var(--acid-lime))] text-[hsl(var(--acid-lime))]" 
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showCount && reviewCount > 0 && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
