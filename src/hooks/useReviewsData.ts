
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReviewsData = (makerId?: string, makerType?: string | null) => {
  return useQuery({
    queryKey: ['reviews', makerId, makerType],
    queryFn: async () => {
      if (!makerId || makerType !== 'manufacturer') return [];
      
      const { data, error } = await supabase
        .from('manufacturer_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles(username)
        `)
        .eq('manufacturer_id', makerId);
      
      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }
      
      return data.map(review => {
        const profileData = review.profiles as { username: string } | { username: string }[] | null;
        let username = 'Anonymous';
        
        if (profileData) {
          if (Array.isArray(profileData)) {
            username = profileData[0]?.username || 'Anonymous';
          } else {
            username = profileData.username || 'Anonymous';
          }
        }
        
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          date: new Date(review.created_at).toLocaleDateString(),
          user: username
        };
      });
    },
    enabled: !!makerId && makerType === 'manufacturer',
  });
};
