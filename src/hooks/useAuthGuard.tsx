
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

export function useAuthGuard(redirectPath = '/auth', requireAdmin = false) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(requireAdmin);

  useEffect(() => {
    // First check if user is logged in
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate(redirectPath);
      return;
    }

    // Then check if admin access is required
    if (requireAdmin && user && !checkingAdmin) {
      const checkAdminStatus = async () => {
        setCheckingAdmin(true);
        try {
          const { data, error } = await supabase
            .from('admin_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          if (error || !data) {
            toast({
              title: "Access denied",
              description: "You don't have permission to access this page",
              variant: "destructive",
            });
            navigate('/dashboard');
            return;
          }
          
          setIsAdmin(true);
        } catch (err) {
          console.error("Error checking admin status:", err);
          navigate('/dashboard');
        } finally {
          setCheckingAdmin(false);
        }
      };
      
      checkAdminStatus();
    }
  }, [user, loading, navigate, redirectPath, toast, requireAdmin, checkingAdmin]);

  return { 
    isAuthenticated: !!user, 
    isLoading: loading || checkingAdmin,
    isAdmin: isAdmin 
  };
}

import { supabase } from "@/integrations/supabase/client";
