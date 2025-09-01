
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { checkUserAdminRole } from "@/components/admin/users/utils/secureAdminUtils";

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
        console.log('🔐 Checking admin status for user:', session.user.id);
        try {
          const adminStatus = await checkUserAdminRole(session.user.id);
          setIsAdmin(adminStatus);
          console.log('👑 Admin status:', adminStatus);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [session]);

  const canDelete = isAdmin || (currentUserId && userId === currentUserId);
  console.log('🗑️ Delete permissions:', { isAdmin, currentUserId, userId, canDelete });

  return {
    currentUserId,
    isAdmin,
    canDelete
  };
};
