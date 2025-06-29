import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Share2, ShoppingBag, Info, Star, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CreatorProfile } from "./CreatorProfile";
import { Separator } from "@/components/ui/separator";
import { GalleryImage } from "@/types/gallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/providers/CartProvider";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    addItem
  } = useCart();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(product.hasLiked);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Example product images (in a real app, these would come from the API)
  const productImages = [product.url, ...similarProducts.slice(0, 3).map(p => p.url)];
  const handlePrevious = () => {
    setCurrentImage(prev => prev === 0 ? productImages.length - 1 : prev - 1);
  };
  const handleNext = () => {
    setCurrentImage(prev => prev === productImages.length - 1 ? 0 : prev + 1);
  };
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
      addItem({
        id: product.id.toString(),
        name: product.prompt,
        price: parseFloat(product.price || "0"),
        image_url: product.url,
        metadata: product
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
      addItem({
        id: product.id.toString(),
        name: product.prompt,
        price: parseFloat(product.price || "0"),
        image_url: product.url,
        metadata: product
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
  const creatorEarnings = basePrice * 0.70; // 70% to creator
  const platformFee = basePrice * 0.30; // 30% platform fee
  const estimatedShipping = 5.99;
  const totalPrice = basePrice + estimatedShipping;
  return <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
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
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={productImages[currentImage]} alt={product.prompt} className="object-cover w-full h-full" />
            </div>
            
            {productImages.length > 1 && <>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 rounded-full" onClick={handlePrevious}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 rounded-full" onClick={handleNext}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
                
                <div className="flex justify-center mt-2 space-x-2">
                  {productImages.map((_, index) => <Button key={index} variant={index === currentImage ? "default" : "outline"} size="icon" className="w-2 h-2 rounded-full p-0 min-w-0" onClick={() => setCurrentImage(index)} />)}
                </div>
              </>}
            
            {similarProducts.length > 0 && <div className="mt-4">
                <h4 className="font-medium mb-2">Similar Products</h4>
                <div className="grid grid-cols-2 gap-2">
                  {similarProducts.slice(0, 4).map(item => <div key={item.id} className="aspect-square rounded border cursor-pointer overflow-hidden">
                      <img src={item.url} alt={item.prompt} className="object-cover w-full h-full hover:scale-105 transition-transform" />
                    </div>)}
                </div>
              </div>}
          </div>
          
          {/* Product Info */}
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-slate-50 text-left text-sm font-extralight">{product.prompt}</h2>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-4 w-4 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />)}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">4.0 (12 reviews)</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg">
                  ${product.price}
                </Badge>
              </div>
            </div>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Description</h3>
                  <p className="font-thin text-sm">{product.prompt}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Creator</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={product.creator.avatar} alt={product.creator.name} />
                        <AvatarFallback>{product.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{product.creator.name}</span>
                    </div>
                    <CreatorProfile creator={{
                    id: product.user_id,
                    name: product.creator.name,
                    avatar: product.creator.avatar,
                    bio: "Passionate designer creating unique pieces that blend style and functionality.",
                    followers: 256,
                    joined: "Jan 2023",
                    rating: 4.8,
                    reviewCount: 45,
                    totalSales: 112,
                    earnings: 5600,
                    designs: 37
                  }} creatorDesigns={[product, ...similarProducts]} onLike={onLike} onView={() => {}} onFollow={() => {}} onMessage={() => {}} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Fashion</Badge>
                    <Badge variant="outline">Handmade</Badge>
                    <Badge variant="outline">Modern</Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="shipping" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Shipping Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Estimated delivery: 5-7 business days</li>
                    <li>• Free shipping on orders over $50</li>
                    <li>• International shipping available</li>
                    <li>• Express shipping options available at checkout</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Return Policy</h3>
                  <p className="text-sm">Returns accepted within 30 days of delivery if item is unused and in original packaging.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">4.0</div>
                  <div className="flex-grow">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-5 w-5 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
                    </div>
                    <div className="text-sm text-muted-foreground">Based on 12 reviews</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" /> Write a Review
                </Button>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Jane Doe</div>
                          <div className="text-xs text-muted-foreground">2 weeks ago</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
                      </div>
                    </div>
                    <p className="text-sm">The quality exceeded my expectations! The design is stunning and the product arrived quickly. Highly recommend this creator's work.</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                          <AvatarFallback>RS</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Robert Smith</div>
                          <div className="text-xs text-muted-foreground">1 month ago</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />)}
                      </div>
                    </div>
                    <p className="text-sm">Very nice design and good quality. Shipping was a bit slow but the product is worth the wait.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Price Breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Creator Earnings (70%)</span>
                    <span>${creatorEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee (30%)</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>${estimatedShipping.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  By purchasing, you're directly supporting independent creators.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1" onClick={handleToggleWishlist}>
                  <Heart className={`mr-1 h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  {isInWishlist ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={handleAddToCart} disabled={isAddingToCart}>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button className="w-full" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};