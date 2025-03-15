
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Second query: Check if the user is an admin
  const { data: isAdmin, isLoading: adminCheckLoading } = useQuery({
    queryKey: ['isAdmin', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      // Special case for kalux2@gmail.com
      if (session.user.email === "kalux2@gmail.com") {
        console.log("Special admin account detected:", session.user.email);
        return true;
      }
      
      // Check the admin_roles table
      try {
        const { data, error } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .in('role', ['admin', 'super_admin']);

        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }

        return data && data.length > 0;
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
    isAdmin: !!isAdmin || (session?.user?.email === "kalux2@gmail.com"),
    isLoading: sessionLoading || adminCheckLoading,
    session
  };
};
