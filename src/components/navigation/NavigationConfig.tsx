import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
  children?: NavigationItem[];
}

export const useNavigationConfig = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  // Main navigation items
  const mainNavigation: NavigationItem[] = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Marketplace",
      href: "/marketplace",
    },
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ];

  // Dashboard navigation based on user role
  const getDashboardNavigation = (): NavigationItem[] => {
    if (!user || !profile) return [];

    const dashboardItems: NavigationItem[] = [];

    // All authenticated users get general dashboard
    dashboardItems.push({
      label: "Dashboard",
      href: "/dashboard",
      requiresAuth: true,
    });

    // Role-specific dashboards
    if (profile.is_admin) {
      dashboardItems.push({
        label: "Admin",
        href: "/admin",
        requiresAuth: true,
        roles: ["admin"],
      });
    }

    if (profile.is_creator) {
      dashboardItems.push({
        label: "Creator Dashboard",
        href: "/creator",
        requiresAuth: true,
        roles: ["creator"],
      });
    }

    if (profile.is_artisan) {
      dashboardItems.push({
        label: "Artisan Dashboard", 
        href: "/artisan",
        requiresAuth: true,
        roles: ["artisan"],
      });
    }

    if (profile.is_manufacturer) {
      dashboardItems.push({
        label: "Manufacturer Dashboard",
        href: "/manufacturer", 
        requiresAuth: true,
        roles: ["manufacturer"],
      });
    }

    return dashboardItems;
  };

  // Footer navigation
  const footerNavigation: NavigationItem[] = [
    {
      label: "Privacy Policy",
      href: "/privacy",
    },
    {
      label: "Terms of Service", 
      href: "/terms",
    },
    {
      label: "Support",
      href: "/support",
    },
    {
      label: "Documentation",
      href: "/documentation",
    },
  ];

  return {
    mainNavigation,
    dashboardNavigation: getDashboardNavigation(),
    footerNavigation,
    user,
    profile,
  };
};