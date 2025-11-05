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
    
    // Track task completion based on routes
    const pathname = location.pathname;
    
    if (pathname === '/marketplace') {
      markTaskComplete('browse_marketplace');
    } else if (pathname === '/create') {
      markTaskComplete('explore_tools');
      markTaskComplete('try_ai_generator');
    } else if (pathname === '/artisan' || pathname === '/manufacturer') {
      markTaskComplete('browse_orders');
    } else if (pathname === '/settings') {
      // Profile setup is tracked by actual data, not route
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
