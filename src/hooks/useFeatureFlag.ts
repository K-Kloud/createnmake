import { useFeatureFlags as useFeatureFlagsFromHook } from './useFeatureFlags';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export const useFeatureFlag = (flagName: string): boolean => {
  const { flags, isLoading } = useFeatureFlagsFromHook();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  if (isLoading || !flags) return false;

  const flag = flags.find(f => f.flag_name === flagName);
  
  if (!flag || !flag.is_enabled) return false;

  // Check rollout percentage
  if (flag.rollout_percentage < 100) {
    // Simple hash-based rollout using user ID
    if (user?.id) {
      const hash = user.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const percentage = Math.abs(hash % 100);
      if (percentage >= flag.rollout_percentage) return false;
    } else {
      // For anonymous users, use session-based rollout
      const sessionHash = Math.abs(Date.now() % 100);
      if (sessionHash >= flag.rollout_percentage) return false;
    }
  }

  // Check role targeting
  if (flag.target_roles?.length > 0) {
    if (!user || !profile) return false;
    
    const userRoles = [];
    if (profile.is_admin) userRoles.push('admin');
    if (profile.is_creator) userRoles.push('creator');
    if (profile.is_artisan) userRoles.push('artisan');
    if (profile.is_manufacturer) userRoles.push('manufacturer');
    userRoles.push('user'); // All authenticated users have 'user' role

    const hasTargetRole = flag.target_roles.some(role => userRoles.includes(role));
    if (!hasTargetRole) return false;
  }

  // Check additional conditions
  if (flag.conditions && Object.keys(flag.conditions).length > 0) {
    // Add custom condition logic here if needed
    // For now, assume all conditions pass
  }

  return true;
};

// Helper hook for multiple feature flags
export const useFeatureFlagHelpers = () => {
  const { flags, isLoading } = useFeatureFlagsFromHook();
  
  const isEnabled = (flagName: string) => {
    return useFeatureFlag(flagName);
  };

  return {
    flags,
    isLoading,
    isEnabled
  };
};