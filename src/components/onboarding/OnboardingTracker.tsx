import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { useAuth } from '@/hooks/useAuth';

/**
 * Component that tracks user navigation and marks onboarding tasks as complete
 */
export const OnboardingTracker = () => {
  const location = useLocation();
  const { markTaskComplete, refreshProgress } = useOnboardingProgress();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Mark marketplace browsing as complete when user visits marketplace
    if (location.pathname === '/marketplace') {
      markTaskComplete('browse_marketplace');
    }
  }, [location.pathname, markTaskComplete, user]);

  // Refresh progress when component mounts or location changes
  useEffect(() => {
    if (user) {
      refreshProgress();
    }
  }, [location.pathname, user]);

  return null;
};
