
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types/auth";

export interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

// Public navigation (always visible)
export const publicNavigation: NavigationItem[] = [
  {
    title: "Marketplace",
    href: "/marketplace",
    description: "Discover and purchase unique designs from creators"
  },
  {
    title: "Features",
    href: "/features",
    description: "Learn about our platform's capabilities"
  },
  {
    title: "FAQ",
    href: "/faq",
    description: "Get answers to common questions"
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Get in touch with our support team"
  },
  {
    title: "Testimonials",
    href: "/testimonials",
    description: "See what our users are saying"
  }
];

// Partnership navigation (joining opportunities)
export const partnershipNavigation: NavigationItem[] = [
  {
    title: "Join as Creator",
    href: "/join-us",
    description: "Start creating and selling your designs"
  },
  {
    title: "Join as Artisan",
    href: "/join-artisan",
    description: "Craft custom products for customers"
  },
  {
    title: "Join as Manufacturer",
    href: "/join-manufacturer",
    description: "Partner with us for bulk production"
  }
];

// Authenticated user navigation
export const authenticatedNavigation: NavigationItem[] = [
  {
    title: "Create Design",
    href: "/create",
    description: "Generate new AI-powered designs"
  },
  {
    title: "My Designs",
    href: "/designs",
    description: "View and manage your design collection"
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Manage your account and view analytics"
  },
  {
    title: "Orders",
    href: "/orders",
    description: "Track your orders and purchases"
  },
  {
    title: "Cart",
    href: "/cart",
    description: "View items in your shopping cart"
  },
  {
    title: "Earnings",
    href: "/earnings",
    description: "View your creator earnings"
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Configure your account preferences"
  }
];

// Role-specific navigation sections
export const roleNavigation: NavigationSection[] = [
  {
    title: "Creator",
    items: [
      {
        title: "Creator Dashboard",
        href: "/creator",
        description: "Manage your creative business"
      },
      {
        title: "Creator Onboarding",
        href: "/creator/onboarding",
        description: "Complete your creator profile"
      }
    ]
  },
  {
    title: "Artisan",
    items: [
      {
        title: "Artisan Dashboard",
        href: "/artisan",
        description: "Manage your artisan services"
      },
      {
        title: "Artisan Orders",
        href: "/artisan/orders",
        description: "View and fulfill custom orders"
      },
      {
        title: "Artisan Profile",
        href: "/artisan/profile",
        description: "Manage your artisan profile"
      }
    ]
  },
  {
    title: "Manufacturer",
    items: [
      {
        title: "Manufacturer Dashboard",
        href: "/manufacturer",
        description: "Manage bulk production orders"
      },
      {
        title: "Manufacturer Orders",
        href: "/manufacturer/orders",
        description: "View and manage production orders"
      },
      {
        title: "Manufacturer Profile",
        href: "/manufacturer/profile",
        description: "Manage your manufacturer profile"
      }
    ]
  }
];

// Admin navigation
export const adminNavigation: NavigationItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin",
    description: "System administration overview"
  },
  {
    title: "AI Agents",
    href: "/admin/ai-agents",
    description: "Monitor and manage AI agents"
  },
  {
    title: "Scheduled Jobs",
    href: "/admin/scheduled-jobs",
    description: "Manage automated tasks and jobs"
  },
  {
    title: "System Monitoring",
    href: "/system-monitoring",
    description: "Monitor system performance and health"
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    description: "View detailed system analytics"
  },
  {
    title: "System Management",
    href: "/admin/system",
    description: "Manage system settings and configurations"
  }
];

// CRM navigation
export const crmNavigation: NavigationItem[] = [
  {
    title: "CRM Dashboard",
    href: "/crm/dashboard",
    description: "Customer relationship management"
  },
  {
    title: "CRM Tasks",
    href: "/crm/tasks",
    description: "Manage customer tasks and follow-ups"
  }
];

// Helper function to filter navigation based on user permissions
export const getFilteredNavigation = (
  items: NavigationItem[],
  user: User | null,
  profile: Profile | null
): NavigationItem[] => {
  // For now, return all items if user is authenticated
  // This can be enhanced with more granular permission checks
  return items;
};

// Helper function to check if user has access to a specific role section
export const hasRoleAccess = (
  sectionTitle: string,
  user: User | null,
  profile: Profile | null
): boolean => {
  if (!user || !profile) return false;
  
  switch (sectionTitle.toLowerCase()) {
    case 'creator':
      return profile.is_creator || false;
    case 'artisan':
      return profile.is_artisan || false;
    case 'manufacturer':
      return profile.is_manufacturer || false;
    default:
      return false;
  }
};
