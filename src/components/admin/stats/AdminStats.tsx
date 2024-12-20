import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageStats } from "@/components/admin/ImageStats";
import { Loader2 } from "lucide-react";

export const AdminStats = () => {
  const { data: imageStats, isLoading } = useQuery({
    queryKey: ['imageStats'],
    queryFn: async () => {
      const { data: images } = await supabase
        .from('generated_images')
        .select('id, likes, views');

      if (!images) return { totalImages: 0, totalLikes: 0, totalViews: 0 };

      return {
        totalImages: images.length,
        totalLikes: images.reduce((sum, img) => sum + (img.likes || 0), 0),
        totalViews: images.reduce((sum, img) => sum + (img.views || 0), 0)
      };
    },
    enabled: true,
  });

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return imageStats ? <ImageStats {...imageStats} /> : null;
};