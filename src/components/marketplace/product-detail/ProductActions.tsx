
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Share2, ShoppingBag, Info } from "lucide-react";

interface ProductActionsProps {
  isInWishlist: boolean;
  isAddingToCart: boolean;
  onToggleWishlist: () => void;
  onShare: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export const ProductActions = ({
  isInWishlist,
  isAddingToCart,
  onToggleWishlist,
  onShare,
  onAddToCart,
  onBuyNow
}: ProductActionsProps) => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          By purchasing, you're directly supporting independent creators.
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex-1" onClick={onToggleWishlist}>
          <Heart className={`mr-1 h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
          {isInWishlist ? "Saved" : "Save"}
        </Button>
        <Button variant="outline" onClick={onShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onAddToCart} 
          disabled={isAddingToCart}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </Button>
        <Button className="w-full" onClick={onBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );
};
