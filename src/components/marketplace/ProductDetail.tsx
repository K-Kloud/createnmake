
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { GalleryImage } from "@/types/gallery";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

import { ProductImageGallery } from "./product-detail/ProductImageGallery";
import { ProductInfo } from "./product-detail/ProductInfo";
import { ProductTabs } from "./product-detail/ProductTabs";
import { PriceBreakdown } from "./product-detail/PriceBreakdown";
import { ProductActions } from "./product-detail/ProductActions";
import { SimilarProducts } from "./product-detail/SimilarProducts";

interface ProductDetailProps {
  isOpen: boolean;
  onClose: () => void;
  product: GalleryImage;
  onLike: (imageId: number) => void;
  onShare: (imageId: number) => void;
  similarProducts?: GalleryImage[];
}

export const ProductDetail = ({
  isOpen,
  onClose,
  product,
  onLike,
  onShare,
  similarProducts = []
}: ProductDetailProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { dispatch } = useCart();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(product.hasLiked);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Example product images (in a real app, these would come from the API)
  const productImages = [product.url, ...similarProducts.slice(0, 3).map(p => p.url)];

  const handleToggleWishlist = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }
    setIsInWishlist(!isInWishlist);
    onLike(product.id);
    toast({
      title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
      description: isInWishlist ? "This item has been removed from your wishlist" : "This item has been added to your wishlist"
    });
  };

  const handleShare = () => {
    onShare(product.id);
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Product link copied to clipboard"
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a purchase",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      // Add item to cart
      dispatch({
        type: 'ADD_ITEM',
        payload: { product, quantity: 1 }
      });

      toast({
        title: "Added to Cart",
        description: "This product has been added to your cart"
      });

      // Optional: Close dialog after adding to cart
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a purchase",
        variant: "destructive"
      });
      return;
    }

    try {
      // Add to cart first
      dispatch({
        type: 'ADD_ITEM',
        payload: { product, quantity: 1 }
      });

      // Navigate to checkout
      navigate('/checkout');
      onClose();
    } catch (error) {
      console.error('Error with buy now:', error);
      toast({
        title: "Error",
        description: "Failed to proceed to checkout. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Format price components
  const basePrice = parseFloat(product.price || "0");
  const estimatedShipping = 5.99;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Explore this unique design and make it yours
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Product Images */}
          <div className="relative">
            <ProductImageGallery images={productImages} productName={product.prompt} />
            <SimilarProducts products={similarProducts} />
          </div>
          
          {/* Product Info */}
          <div>
            <ProductInfo product={product} />
            
            <ProductTabs 
              product={product} 
              similarProducts={similarProducts} 
              onLike={onLike} 
            />
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <PriceBreakdown 
                basePrice={basePrice} 
                estimatedShipping={estimatedShipping} 
              />
              
              <ProductActions
                isInWishlist={isInWishlist}
                isAddingToCart={isAddingToCart}
                onToggleWishlist={handleToggleWishlist}
                onShare={handleShare}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
