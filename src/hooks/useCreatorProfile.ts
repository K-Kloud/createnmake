import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreatorProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  social_links: Record<string, string>;
  created_at: string;
  is_creator: boolean;
}

export const useCreatorProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['creator-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          website,
          location,
          social_links,
          created_at,
          is_creator
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as CreatorProfile;
    },
    enabled: !!userId,
  });
};