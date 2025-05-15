
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

export function useAuthGuard(redirectPath = '/') {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate(redirectPath);
    }
  }, [user, loading, navigate, redirectPath, toast]);

  return { isAuthenticated: !!user, isLoading: loading };
}
