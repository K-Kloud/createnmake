
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useOrdersData = (userId: string | undefined, limit?: number) => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      
      // Query both artisan and manufacturer quotes
      const [artisanResult, quoteResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit || 5),
          
        supabase
          .from('quote_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit || 5)
      ]);
      
      if (artisanResult.error) throw artisanResult.error;
      if (quoteResult.error) throw quoteResult.error;
      
      // Combine and sort all orders
      const allOrders = [
        ...(artisanResult.data || []).map(o => ({...o, type: 'artisan'})),
        ...(quoteResult.data || []).map(o => ({...o, type: 'manufacturer'}))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return limit ? allOrders.slice(0, limit) : allOrders;
    },
    enabled: !!userId,
  });

  return { orders, isLoading };
};
