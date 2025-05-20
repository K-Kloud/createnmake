import { useState, useEffect } from "react";
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { PaginatedMarketplace } from "@/components/marketplace/PaginatedMarketplace";
import { GalleryImage } from "@/types/gallery";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeNotification } from "@/services/notificationService";
import { ProductDetail } from "@/components/marketplace/ProductDetail";
import { Wishlist } from "@/components/marketplace/Wishlist";
import { useToast } from "@/hooks/use-toast";
import { ImageCard } from "@/components/gallery/ImageCard";
import { useInView } from "react-intersection-observer";

interface MarketplaceContentProps {
  isLoading: boolean;
  images: GalleryImage[];
  onLike: (imageId: number) => void;
  onView: (imageId: number) => void;
  onAddComment: (imageId: number, comment: string) => void;
  onAddReply: (imageId: number, commentId: number, reply: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const MarketplaceContent = ({
  isLoading,
  images,
  onLike,
  onView,
  onAddComment,
  onAddReply,
  onLoadMore,
  hasMore,
  error,
  onRetry
}: MarketplaceContentProps) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<GalleryImage[]>([]);
  const [viewMode, setViewMode] = useState<"paginated" | "infinite">("paginated");
  
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

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    
    if (image.price) {
      // If image has a price, open product detail
      fetchSimilarProducts(image);
      setIsProductDetailOpen(true);
    } else {
      // Otherwise open regular preview
      setIsProductDetailOpen(true);
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

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && viewMode === "infinite") {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore, viewMode]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode("paginated")}
            className={`px-3 py-1 rounded-md ${viewMode === "paginated" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            aria-label="Switch to paginated view"
          >
            Paginated
          </button>
          <button 
            onClick={() => setViewMode("infinite")}
            className={`px-3 py-1 rounded-md ${viewMode === "infinite" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            aria-label="Switch to infinite scroll view"
          >
            Infinite Scroll
          </button>
        </div>
        <Wishlist onProductClick={handleImageClick} />
      </div>
      
      {viewMode === "paginated" ? (
        <PaginatedMarketplace
          images={images}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          onLike={onLike}
          onView={onView}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
          onImageClick={handleImageClick}
        />
      ) : (
        <>
          {isLoading && images.length === 0 ? (
            <MarketplaceLoader />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                    <ImageCard
                      image={image}
                      onLike={onLike}
                      onView={onView}
                      onAddComment={onAddComment}
                      onAddReply={onAddReply}
                      onFullImageClick={() => handleImageClick(image)}
                    />
                  </div>
                ))}
              </div>
              {hasMore && (
                <div ref={ref} className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedImage && (
        <ProductDetail 
          isOpen={isProductDetailOpen}
          onClose={() => setIsProductDetailOpen(false)}
          product={selectedImage}
          onLike={onLike}
          onShare={handleProductShare}
          similarProducts={similarProducts}
        />
      )}
    </>
  );
};
