import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductRating {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

export const useProductRatings = (productIds: number[]) => {
  return useQuery({
    queryKey: ['product-ratings', productIds],
    queryFn: async () => {
      if (!productIds.length) return {};
      
      // Fetch creator ratings from generated_images and their reviews
      const { data: images, error } = await supabase
        .from('generated_images')
        .select(`
          id,
          user_id,
          profiles!generated_images_user_id_fkey (
            id
          )
        `)
        .in('id', productIds);

      if (error) throw error;

      // Get unique creator IDs
      const creatorIds = [...new Set(images?.map(img => img.user_id).filter(Boolean))];

      if (!creatorIds.length) return {};

      // Fetch artisan reviews for these creators
      const { data: reviews, error: reviewsError } = await supabase
        .from('artisan_reviews')
        .select('artisan_id, rating')
        .in('artisan_id', creatorIds);

      if (reviewsError) throw reviewsError;

      // Calculate average ratings per creator
      const creatorRatings: Record<string, { rating: number; count: number }> = {};
      
      reviews?.forEach(review => {
        if (!creatorRatings[review.artisan_id]) {
          creatorRatings[review.artisan_id] = { rating: 0, count: 0 };
        }
        creatorRatings[review.artisan_id].rating += review.rating;
        creatorRatings[review.artisan_id].count += 1;
      });

      // Map back to products
      const productRatings: Record<number, ProductRating> = {};
      
      images?.forEach(img => {
        const creatorData = creatorRatings[img.user_id];
        if (creatorData) {
          productRatings[img.id] = {
            productId: img.id,
            averageRating: creatorData.rating / creatorData.count,
            reviewCount: creatorData.count
          };
        } else {
          productRatings[img.id] = {
            productId: img.id,
            averageRating: 0,
            reviewCount: 0
          };
        }
      });

      return productRatings;
    },
    enabled: productIds.length > 0,
  });
};
