
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetFooter, 
  SheetClose 
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { GalleryImage } from "@/types/gallery";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface WishlistItem extends GalleryImage {}

interface WishlistProps {
  onProductClick: (product: WishlistItem) => void;
}

export const Wishlist = ({ onProductClick }: WishlistProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist items when the component mounts or user changes
  useEffect(() => {
    if (user?.id && isOpen) {
      loadWishlistItems();
    }
  }, [user?.id, isOpen]);

  const loadWishlistItems = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      // Fetch liked images for the current user
      const { data: likedImages, error } = await supabase
        .from('image_likes')
        .select(`
          image_id,
          generated_images!inner (
            id,
            image_url,
            prompt,
            price,
            likes,
            views,
            created_at,
            user_id,
            profiles!generated_images_user_id_fkey (
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .limit(10);
      
      if (error) throw error;
      
      // Transform data for display
      const wishlistItems: WishlistItem[] = (likedImages || []).map((item) => {
        const image = item.generated_images;
        return {
          id: image.id,
          url: image.image_url,
          prompt: image.prompt,
          price: image.price || "0",
          likes: image.likes || 0,
          views: image.views || 0,
          produced: 0,
          comments: [],
          creator: {
            name: image.profiles?.username || 'Anonymous',
            avatar: image.profiles?.avatar_url || 'https://github.com/shadcn.png'
          },
          createdAt: new Date(image.created_at),
          timeAgo: '',
          hasLiked: true,
          image_likes: [],
          metrics: { like: 0, comment: 0, view: 0 },
          user_id: image.user_id
        };
      });
      
      setItems(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: "Failed to load wishlist",
        description: "There was a problem loading your saved items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (item: WishlistItem) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('image_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('image_id', item.id);
      
      if (error) throw error;
      
      // Update local state
      setItems(items.filter(i => i.id !== item.id));
      
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your saved items"
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Heart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Wishlist</SheetTitle>
          <SheetDescription>
            {items.length > 0 
              ? `You have ${items.length} saved item${items.length > 1 ? 's' : ''}`
              : 'Your wishlist is empty'
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <p className="text-sm text-muted-foreground mb-4">
                Save items you like by clicking the heart icon
              </p>
              <SheetClose asChild>
                <Button onClick={() => navigate("/marketplace")}>
                  Browse Marketplace
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div 
                    className="w-16 h-16 bg-muted rounded overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => {
                      onProductClick(item);
                      setIsOpen(false);
                    }}
                  >
                    <img 
                      src={item.url} 
                      alt={item.prompt} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" title={item.prompt}>
                      {item.prompt}
                    </p>
                    <p className="text-sm text-muted-foreground">By {item.creator.name}</p>
                    {item.price && <p className="font-medium">${item.price}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeFromWishlist(item)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onProductClick(item);
                        setIsOpen(false);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <SheetFooter className="sm:justify-between flex-col sm:flex-row gap-2">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <span className="text-sm font-medium">
                {items.length} Item{items.length !== 1 ? "s" : ""}
              </span>
              <Button 
                variant="link" 
                className="text-sm p-0"
                onClick={() => navigate('/marketplace')}
              >
                Continue Shopping
              </Button>
            </div>
            <Button onClick={handleCheckout} className="w-full sm:w-auto">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
