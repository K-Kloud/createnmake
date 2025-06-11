
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types/auth";

export interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
  children?: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

// Main navigation items accessible to all users
export const publicNavigation: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    description: "Welcome to Create2Make"
  },
  {
    title: "Features",
    href: "/features",
    description: "Discover our platform capabilities"
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    description: "Browse and purchase unique designs"
  },
  {
    title: "Testimonials",
    href: "/testimonials",
    description: "What our users say about us"
  },
  {
    title: "FAQ",
    href: "/faq",
    description: "Frequently asked questions"
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Get in touch with us"
  }
];

// Partnership navigation for joining the platform
export const partnershipNavigation: NavigationItem[] = [
  {
    title: "Join as Manufacturer",
    href: "/join/manufacturer",
    description: "Partner with creators to provide manufacturing services"
  },
  {
    title: "Join as Artisan",
    href: "/join/artisan",
    description: "Share your craft and connect with customers"
  }
];

// Authenticated user navigation
export const authenticatedNavigation: NavigationItem[] = [
  {
    title: "Create",
    href: "/create",
    description: "Generate new AI designs",
    requiresAuth: true
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Manage your account and creations",
    requiresAuth: true
  },
  {
    title: "My Designs",
    href: "/designs",
    description: "View and manage your designs",
    requiresAuth: true
  },
  {
    title: "Orders",
    href: "/orders",
    description: "Track your orders and purchases",
    requiresAuth: true
  },
  {
    title: "Notifications",
    href: "/notifications",
    description: "View your notifications",
    requiresAuth: true
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Account and preference settings",
    requiresAuth: true
  },
  {
    title: "Subscription",
    href: "/subscription",
    description: "Manage your subscription plan",
    requiresAuth: true
  }
];

// Role-specific navigation sections
export const roleNavigation: NavigationSection[] = [
  {
    title: "CRM",
    items: [
      {
        title: "CRM Dashboard",
        href: "/crm",
        description: "Customer relationship management",
        requiresAuth: true
      },
      {
        title: "Contacts",
        href: "/crm/contacts",
        description: "Manage your contacts",
        requiresAuth: true
      },
      {
        title: "Tasks",
        href: "/crm/tasks",
        description: "Manage your tasks",
        requiresAuth: true
      },
      {
        title: "Calendar",
        href: "/crm/calendar",
        description: "View your calendar",
        requiresAuth: true
      },
      {
        title: "Analytics",
        href: "/crm/analytics",
        description: "Business analytics",
        requiresAuth: true
      },
      {
        title: "Communications",
        href: "/crm/communications",
        description: "Communication center",
        requiresAuth: true
      }
    ]
  },
  {
    title: "Creator",
    items: [
      {
        title: "Creator Dashboard",
        href: "/creator",
        description: "Manage your creative business",
        requiresAuth: true,
        roles: ["creator"]
      },
      {
        title: "Creator Onboarding",
        href: "/creator/onboarding",
        description: "Complete your creator profile",
        requiresAuth: true
      }
    ]
  },
  {
    title: "Artisan",
    items: [
      {
        title: "Artisan Dashboard",
        href: "/artisan",
        description: "Manage your craft business",
        requiresAuth: true,
        roles: ["artisan"]
      },
      {
        title: "Artisan Onboarding",
        href: "/artisan/onboarding",
        description: "Complete your artisan profile",
        requiresAuth: true
      }
    ]
  },
  {
    title: "Manufacturer",
    items: [
      {
        title: "Manufacturer Dashboard",
        href: "/manufacturer",
        description: "Manage your manufacturing business",
        requiresAuth: true,
        roles: ["manufacturer"]
      },
      {
        title: "Manufacturer Onboarding",
        href: "/manufacturer/onboarding",
        description: "Complete your manufacturer profile",
        requiresAuth: true
      }
    ]
  }
];

// Admin navigation
export const adminNavigation: NavigationItem[] = [
  {
    title: "Admin Panel",
    href: "/admin",
    description: "Administrative controls",
    requiresAuth: true,
    roles: ["admin"]
  }
];

// Helper function to check if user has access to a navigation item
export const hasAccessToNavItem = (
  item: NavigationItem,
  user: User | null,
  profile: Profile | null
): boolean => {
  if (!item.requiresAuth) return true;
  if (!user) return false;
  
  if (item.roles && item.roles.length > 0) {
    if (!profile) return false;
    
    // Check if user has any of the required roles
    return item.roles.some(role => {
      switch (role) {
        case "admin":
          return profile.is_admin;
        case "creator":
          return profile.is_creator;
        case "artisan":
          return profile.is_artisan;
        case "manufacturer":
          return profile.is_manufacturer;
        default:
          return false;
      }
    });
  }
  
  return true;
};

// Get filtered navigation based on user permissions
export const getFilteredNavigation = (
  navigation: NavigationItem[],
  user: User | null,
  profile: Profile | null
): NavigationItem[] => {
  return navigation.filter(item => hasAccessToNavItem(item, user, profile));
};
