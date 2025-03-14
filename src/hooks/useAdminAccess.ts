import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAccess = () => {
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: isAdmin, isLoading: adminCheckLoading } = useQuery({
    queryKey: ['isAdmin', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      // First check if this is the special kalux2@gmail.com account by email
      if (session.user.email === "kalux2@gmail.com") {
        console.log("Special admin account detected:", session.user.email);
        return true;
      }
      
      // Otherwise check the admin_roles table
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
    },
    enabled: !!session?.user?.id,
  });

  return {
    isAdmin: !!isAdmin,
    isLoading: sessionLoading || adminCheckLoading,
    session
  };
};
