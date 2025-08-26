
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePortfolioData = (makerId?: string, makerType?: string | null) => {
  return useQuery({
    queryKey: ['portfolio', makerId],
    queryFn: async () => {
      if (!makerId) return [];
      
      const { data, error } = await supabase
        .from('manufacturer_portfolios')
        .select('*')
        .eq('manufacturer_id', makerId);
      
      if (error) {
        console.error('Error fetching portfolio:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        generatedImage: item.generatedimage || '',
        productImage: item.productimage || item.generatedimage || '',
        description: item.description
      }));
    },
    enabled: !!makerId && makerType === 'manufacturer',
  });
};
