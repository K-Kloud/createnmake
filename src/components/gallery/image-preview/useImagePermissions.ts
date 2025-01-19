import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useImagePermissions = (userId?: string) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
        const { data: adminRoles } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!adminRoles);
      }
    };

    checkAdminStatus();
  }, [session]);

  const canDelete = isAdmin || (currentUserId && userId === currentUserId);

  return {
    currentUserId,
    isAdmin,
    canDelete
  };
};