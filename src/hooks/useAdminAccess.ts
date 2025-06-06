
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { checkUserAdminRole } from "@/components/admin/users/utils/secureAdminUtils";

export const useAdminAccess = () => {
  // First query: Get the current session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  // Second query: Check if the user is an admin using secure function
  const { data: isAdmin, isLoading: adminCheckLoading } = useQuery({
    queryKey: ['isAdmin', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      // Use secure admin role checking
      try {
        return await checkUserAdminRole(session.user.id);
      } catch (err) {
        console.error('Exception checking admin status:', err);
        return false;
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  return {
    isAdmin: !!isAdmin,
    isLoading: sessionLoading || adminCheckLoading,
    session
  };
};
