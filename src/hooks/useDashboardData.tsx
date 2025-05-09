
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export const useDashboardData = (session: Session | null, user: User | null) => {
  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Query for generated images count
  const { data: generatedImagesCount = 0 } = useQuery({
    queryKey: ['generatedImagesCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  // Query for likes count
  const { data: likesCount = 0 } = useQuery({
    queryKey: ['likesCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('image_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  // Query for orders count
  const { data: ordersCount = 0 } = useQuery({
    queryKey: ['ordersCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      // Count all quote requests and artisan quotes
      const [artisanResult, quoteResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id),
          
        supabase
          .from('quote_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
      ]);
      
      const artisanCount = artisanResult.count || 0;
      const quoteCount = quoteResult.count || 0;
      
      return artisanCount + quoteCount;
    },
    enabled: !!session?.user?.id,
  });

  // Query for product count (images with prices)
  const { data: productsCount = 0 } = useQuery({
    queryKey: ['productsCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      const { count } = await supabase
        .from('generated_images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .not('price', 'is', null);
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  return {
    profile,
    generatedImagesCount,
    likesCount,
    ordersCount,
    productsCount
  };
};
