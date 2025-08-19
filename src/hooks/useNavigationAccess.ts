import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export interface AccessControlItem {
  id: string;
  label: string;
  path: string;
  requires_auth: boolean;
  allowed_roles: string[];
  is_external?: boolean;
  target?: '_blank' | '_self';
}

export const useNavigationAccess = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const hasAccess = useMemo(() => {
    return (item: AccessControlItem): boolean => {
      // If authentication is required but user is not logged in
      if (item.requires_auth && !user) {
        return false;
      }

      // If no specific roles are required, allow access
      if (!item.allowed_roles || item.allowed_roles.length === 0) {
        return true;
      }

      // If user is logged in but no profile, only allow guest access
      if (user && !profile) {
        return item.allowed_roles.includes('guest') || item.allowed_roles.includes('user');
      }

      // Check if user's role is in allowed roles
      if (profile?.role) {
        return item.allowed_roles.includes(profile.role) || item.allowed_roles.includes('user');
      }

      // Default to guest access if logged in
      if (user) {
        return item.allowed_roles.includes('guest') || item.allowed_roles.includes('user');
      }

      // Default deny
      return false;
    };
  }, [user, profile]);

  const filterByAccess = useMemo(() => {
    return <T extends AccessControlItem>(items: T[]): T[] => {
      return items.filter(hasAccess);
    };
  }, [hasAccess]);

  const getUserRole = useMemo(() => {
    if (!user) return 'guest';
    if (!profile) return 'user';
    return profile.role || 'user';
  }, [user, profile]);

  const isAuthenticated = !!user;
  const hasProfile = !!profile;

  return {
    hasAccess,
    filterByAccess,
    getUserRole,
    isAuthenticated,
    hasProfile,
    user,
    profile
  };
};