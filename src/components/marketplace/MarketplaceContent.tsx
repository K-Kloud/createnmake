import { useState, useEffect } from "react";
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { GalleryImage } from "@/types/gallery";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeNotification } from "@/services/notificationService";
import { ProductDetail } from "@/components/marketplace/ProductDetail";
import { Wishlist, WishlistItem } from "@/components/marketplace/Wishlist";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceContentProps {
  isLoading: boolean;
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const MarketplaceContent = ({
  isLoading,
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  onLoadMore,
  hasMore
}: MarketplaceContentProps) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<GalleryImage[]>([]);
  
  // Check for new user session and send welcome notification
  useEffect(() => {
    const checkAndSendWelcome = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        // Check local storage to see if we've sent a welcome notification before
        const welcomeSent = localStorage.getItem(`welcome_sent_${data.session.user.id}`);
        if (!welcomeSent) {
          // Send welcome notification
          await sendWelcomeNotification(data.session.user.id);
          // Mark that we've sent a welcome notification
          localStorage.setItem(`welcome_sent_${data.session.user.id}`, 'true');
        }
      }
    };
    
    checkAndSendWelcome();
  }, []);

  const fetchSimilarProducts = (product: GalleryImage) => {
    // Filter existing images to find similar items based on prompt keywords
    // In a real app, this would be an API call to get recommended products
    const keywords = product.prompt?.toLowerCase().split(' ') || [];
    const similar = images
      .filter(img => img.id !== product.id)
      .filter(img => {
        const imgKeywords = img.prompt?.toLowerCase().split(' ') || [];
        return keywords.some(keyword => 
          imgKeywords.includes(keyword) && keyword.length > 3
        );
      })
      .slice(0, 4);
    
    setSimilarProducts(similar);
  };

  if (isLoading) {
    return <MarketplaceLoader />;
  }

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    
    if (image.price) {
      // If image has a price, open product detail
      fetchSimilarProducts(image);
      setIsProductDetailOpen(true);
    } else {
      // Otherwise open regular preview
      setIsPreviewOpen(true);
    }
    
    onView(image.id);
  };

  const handleProductShare = (productId: number) => {
    const productUrl = `${window.location.origin}/marketplace?product=${productId}`;
    navigator.clipboard.writeText(productUrl);
    
    toast({
      title: "Link Copied",
      description: "Product link has been copied to your clipboard"
    });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Wishlist onProductClick={handleImageClick} />
      </div>
      
      <MarketplaceGrid
        images={images}
        onLike={onLike}
        onView={onView}
        onAddComment={onAddComment}
        onAddReply={onAddReply}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        onImageClick={handleImageClick}
      />

      {selectedImage && (
        <>
          <ProductDetail 
            isOpen={isProductDetailOpen}
            onClose={() => setIsProductDetailOpen(false)}
            product={selectedImage}
            onLike={onLike}
            onShare={handleProductShare}
            similarProducts={similarProducts}
          />
        </>
      )}
    </>
  );
};
