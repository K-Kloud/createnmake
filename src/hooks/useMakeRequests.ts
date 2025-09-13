import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMakeRequests = (creatorId: string | undefined) => {
  return useQuery({
    queryKey: ['make-requests', creatorId],
    queryFn: async () => {
      if (!creatorId) return [];
      
      const { data, error } = await supabase
        .from('make_requests')
        .select(`
          *,
          profiles!make_requests_user_id_fkey(username, display_name, avatar_url)
        `)
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!creatorId,
  });
};