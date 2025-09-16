import { useState, useEffect } from "react";
import { MarketplaceLoader } from "@/components/marketplace/MarketplaceLoader";
import { PaginatedMarketplace } from "@/components/marketplace/PaginatedMarketplace";
import { GalleryImage } from "@/types/gallery";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeNotification } from "@/services/notificationService";
import { ProductDetail } from "@/components/marketplace/ProductDetail";
import { Wishlist } from "@/components/marketplace/Wishlist";
import { useToast } from "@/hooks/use-toast";
import { ImprovedImageGallery } from "@/components/gallery/ImprovedImageGallery";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { useEcommerceTracking } from "@/hooks/useEcommerceTracking";
import { useConversionTracking } from "@/hooks/useConversionTracking";
import { useAnalyticsContext } from "@/providers/AnalyticsProvider";

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
  const { t } = useTranslation('common');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<GalleryImage[]>([]);
  const [viewMode, setViewMode] = useState<"paginated" | "infinite">("infinite");
  
  const { trackProductView } = useEcommerceTracking();
  const { trackMarketplacePurchaseFunnel } = useConversionTracking();
  const { trackInteraction } = useAnalyticsContext();
  
  // Check for new user session and send welcome notification
  useEffect(() => {
    const checkAndSendWelcome = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.id) {
          const welcomeSent = localStorage.getItem(`welcome_sent_${data.session.user.id}`);
          if (!welcomeSent) {
            await sendWelcomeNotification(data.session.user.id);
            localStorage.setItem(`welcome_sent_${data.session.user.id}`, 'true');
          }
        }
      } catch (error) {
        console.error("Error sending welcome notification:", error);
      }
    };
    
    checkAndSendWelcome();
  }, []);

  const fetchSimilarProducts = (product: GalleryImage) => {
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
    console.log("🖼️ Image clicked:", image.id, image.url);
    setSelectedImage(image);
    
    // Track product view for e-commerce
    if (image.price) {
      trackProductView(
        image.id.toString(), 
        image.title || image.prompt || 'Untitled', 
        image.item_type || 'general'
      );
      trackMarketplacePurchaseFunnel('product_viewed', image.id.toString());
    }
    
    if (image.price) {
      fetchSimilarProducts(image);
      setIsProductDetailOpen(true);
    } else {
      setIsProductDetailOpen(true);
    }
    
    onView(image.id);
  };

  const handleProductShare = (productId: number) => {
    const productUrl = `${window.location.origin}/marketplace?product=${productId}`;
    navigator.clipboard.writeText(productUrl);
    
    trackInteraction('share', productId.toString(), 'product_share', { method: 'clipboard' });
    
    toast({
      title: t('gallery.linkCopied'),
      description: t('gallery.linkCopiedDescription')
    });
  };

  const handleViewModeChange = (mode: "paginated" | "infinite") => {
    trackInteraction('view_mode_toggle', mode, `Switch to ${mode}`, { previous_mode: viewMode });
    setViewMode(mode);
  };

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && viewMode === "infinite" && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, onLoadMore, viewMode, isLoading]);

  // Debug logging
  useEffect(() => {
    console.log("📊 MarketplaceContent state:", {
      isLoading,
      imageCount: images.length,
      hasMore,
      error: !!error,
      viewMode
    });
  }, [isLoading, images.length, hasMore, error, viewMode]);

  return (
    <>
      <div className="flex justify-end mb-4">
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
        <ImprovedImageGallery
          images={images}
          onLike={onLike}
          onView={onView}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          onImageClick={handleImageClick}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
        />
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
