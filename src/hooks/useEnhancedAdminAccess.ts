
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { checkUserAdminRole } from "@/components/admin/users/utils/secureAdminUtils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

interface AdminAccessResult {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  session: any;
  hasPermission: (requiredRole?: 'admin' | 'super_admin') => boolean;
}

export const useEnhancedAdminAccess = (): AdminAccessResult => {
  const { session, loading: authLoading } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  // First query: Check if the user is an admin
  const { data: isAdmin, isLoading: adminCheckLoading, error: adminError } = useQuery({
    queryKey: ['isAdmin', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      try {
        return await checkUserAdminRole(session.user.id, 'admin');
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError(err as Error);
        return false;
      }
    },
    enabled: !!session?.user?.id && !authLoading,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Second query: Check if the user is a super admin
  const { data: isSuperAdmin, isLoading: superAdminCheckLoading, error: superAdminError } = useQuery({
    queryKey: ['isSuperAdmin', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      try {
        return await checkUserAdminRole(session.user.id, 'super_admin');
      } catch (err) {
        console.error('Error checking super admin status:', err);
        setError(err as Error);
        return false;
      }
    },
    enabled: !!session?.user?.id && !authLoading,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Update error state from queries
  useEffect(() => {
    if (adminError) setError(adminError as Error);
    if (superAdminError) setError(superAdminError as Error);
  }, [adminError, superAdminError]);

  const hasPermission = (requiredRole?: 'admin' | 'super_admin') => {
    if (!session?.user) return false;
    
    if (!requiredRole) return true; // No specific role required
    
    switch (requiredRole) {
      case 'admin':
        return !!isAdmin || !!isSuperAdmin; // Super admin has admin permissions
      case 'super_admin':
        return !!isSuperAdmin;
      default:
        return false;
    }
  };

  return {
    isAdmin: !!isAdmin,
    isSuperAdmin: !!isSuperAdmin,
    isLoading: authLoading || adminCheckLoading || superAdminCheckLoading,
    error,
    session,
    hasPermission
  };
};
