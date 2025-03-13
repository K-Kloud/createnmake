
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GalleryImage } from "@/types/gallery";

export const useMarketplaceImages = (userId?: string) => {
  return useQuery({
    queryKey: ['marketplaceImages'],
    queryFn: async () => {
      const { data: imagesData, error: imagesError } = await supabase
        .from('generated_images')
        .select(`
          id,
          image_url,
          prompt,
          likes,
          views,
          created_at,
          user_id,
          is_public,
          image_likes (user_id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (imagesError) throw imagesError;

      const userIds = imagesData.map(image => image.user_id).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      return imagesData.map(image => ({
        id: image.id,
        url: image.image_url,
        prompt: image.prompt,
        likes: image.likes || 0,
        comments: [],
        views: image.views || 0,
        produced: 0,
        creator: {
          name: profilesData?.find(profile => profile.id === image.user_id)?.username || 'Anonymous',
          avatar: "https://github.com/shadcn.png"
        },
        createdAt: new Date(image.created_at),
        hasLiked: image.image_likes?.some(like => like.user_id === userId) || false
      })) as GalleryImage[];
    },
    enabled: true,
  });
};
