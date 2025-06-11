import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceGrid } from "./MarketplaceGrid";
import { GalleryImage } from "@/types/gallery";
import { useTranslation } from "react-i18next";

export const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('marketplace');

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('image_id, images(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const items = data.map(item => ({
          ...(item.images as any),
          hasLiked: true,
        })) as GalleryImage[];
        setWishlistItems(items);
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
        toast({
          title: t('gallery:errorLoadingWishlist'),
          description: t('gallery:errorLoadingWishlistDescription'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, [session, toast, t]);

  const handleRemoveFromWishlist = async (imageId: number) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', session.user.id)
        .eq('image_id', imageId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== imageId));
      
      toast({
        title: t('wishlist.removedFromWishlist'),
        description: t('wishlist.removedDescription'),
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: t('gallery:errorRemovingItem'),
        description: t('gallery:errorRemovingItemDescription'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('wishlist.empty')}</h3>
          <p className="text-gray-600 mb-6">{t('wishlist.emptyDescription')}</p>
          <Button onClick={() => window.location.href = '/marketplace'}>
            {t('wishlist.browseMarketplace')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('wishlist.title')}</h2>
        <span className="text-gray-600">
          {t('wishlist.itemCount', { count: wishlistItems.length })}
        </span>
      </div>
      
      <MarketplaceGrid
        images={wishlistItems}
        onLike={(imageId) => handleRemoveFromWishlist(imageId)}
        onView={() => {}}
        onAddComment={() => {}}
        onAddReply={() => {}}
        onLoadMore={() => {}}
        hasMore={false}
        onImageClick={() => {}}
      />
    </div>
  );
};
