import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GalleryImage } from "@/types/gallery";

export const useCreatorPortfolio = (userId: string | undefined, limit = 12) => {
  return useQuery({
    queryKey: ['creator-portfolio', userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .from('generated_images')
        .select(`
          id,
          prompt,
          image_url,
          created_at,
          likes,
          views,
          price,
          item_type,
          tags,
          is_public
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        url: item.image_url || '',
        prompt: item.prompt,
        timeAgo: new Date(item.created_at).toLocaleDateString(),
        creator: { name: '', avatar: '' },
        likes: item.likes || 0,
        views: item.views || 0,
        price: item.price,
        comments: [],
        produced: 0,
        createdAt: new Date(item.created_at),
        hasLiked: false,
        image_likes: [],
        metrics: {
          like: item.likes || 0,
          comment: 0,
          view: item.views || 0
        },
        user_id: userId,
        item_type: item.item_type,
        tags: item.tags || []
      })) as GalleryImage[];
    },
    enabled: !!userId,
  });
};