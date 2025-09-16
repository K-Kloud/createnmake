import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useArtisanPortfolio = (artisanId: string | undefined) => {
  return useQuery({
    queryKey: ['artisan-portfolio', artisanId],
    queryFn: async () => {
      if (!artisanId) return [];
      
      const { data, error } = await supabase
        .from('artisan_portfolio')
        .select('*')
        .eq('artisan_id', artisanId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!artisanId,
  });
};