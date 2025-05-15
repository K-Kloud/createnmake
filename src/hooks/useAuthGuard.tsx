
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

export function useAuthGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/'); // Redirect to homepage if not authenticated
    }
  }, [user, loading, navigate]);
}
