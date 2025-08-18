import { User } from "@supabase/supabase-js";
import { Profile } from "@/types/auth";

export interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
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
    description: "Generate new AI-powered designs",
    requiresAuth: true
  },
  {
    title: "My Designs",
    href: "/designs",
    description: "View and manage your design collection",
    requiresAuth: true
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Manage your account and view analytics",
    requiresAuth: true
  },
  {
    title: "Products",
    href: "/products",
    description: "Manage your product inventory and analytics",
    requiresAuth: true
  },
  {
    title: "Orders",
    href: "/orders",
    description: "Track your orders and purchases",
    requiresAuth: true
  },
  {
    title: "Earnings",
    href: "/earnings",
    description: "View your creator earnings and revenue analytics",
    requiresAuth: true
  },
  {
    title: "Cart",
    href: "/cart",
    description: "View items in your shopping cart",
    requiresAuth: true
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Configure your account preferences",
    requiresAuth: true
  }
];

// Role-specific navigation sections
export const roleNavigation: NavigationSection[] = [
  {
    title: "Creator",
    items: [
      {
        title: "Creator Dashboard", 
        href: "/creator/dashboard",
        description: "Manage your creative business",
        requiresAuth: true,
        roles: ["creator"]
      },
      {
        title: "Creator Onboarding",
        href: "/creator/onboarding",
        description: "Complete your creator profile",
        requiresAuth: true,
        roles: ["creator"]
      },
      {
        title: "Sales Performance",
        href: "/creator/performance",
        description: "Analyze your sales and performance metrics",
        requiresAuth: true,
        roles: ["creator"]
      }
    ]
  },
  {
    title: "Artisan",
    items: [
      {
        title: "Artisan Dashboard",
        href: "/artisan/dashboard", 
        description: "Manage your artisan services",
        requiresAuth: true,
        roles: ["artisan"]
      },
      {
        title: "Artisan Orders",
        href: "/artisan/orders",
        description: "View and fulfill custom orders",
        requiresAuth: true,
        roles: ["artisan"]
      },
      {
        title: "Portfolio",
        href: "/artisan/portfolio",
        description: "Showcase your work and skills",
        requiresAuth: true,
        roles: ["artisan"]
      }
    ]
  },
  {
    title: "Manufacturer",
    items: [
      {
        title: "Manufacturer Dashboard",
        href: "/manufacturer/dashboard",
        description: "Manage bulk production orders",
        requiresAuth: true,
        roles: ["manufacturer"] 
      },
      {
        title: "Production Queue",
        href: "/manufacturer/production",
        description: "View and manage production pipeline",
        requiresAuth: true,
        roles: ["manufacturer"]
      },
      {
        title: "Quality Control",
        href: "/manufacturer/quality",
        description: "Monitor and ensure product quality",
        requiresAuth: true,
        roles: ["manufacturer"]
      }
    ]
  }
];

// Admin navigation
export const adminNavigation: NavigationItem[] = [
  {
    title: "Admin Dashboard", 
    href: "/admin/dashboard",
    description: "System administration overview",
    requiresAuth: true,
    roles: ["admin"]
  },
  {
    title: "User Management",
    href: "/admin/users",
    description: "Manage user accounts and roles",
    requiresAuth: true,
    roles: ["admin"]
  },
  {
    title: "System Monitoring",
    href: "/system-monitoring",
    description: "Monitor system performance and health",
    requiresAuth: true,
    roles: ["admin"]
  },
  {
    title: "System Management",
    href: "/admin/system",
    description: "Configure system components and navigation",
    requiresAuth: true,
    roles: ["admin"]
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    description: "View detailed system analytics",
    requiresAuth: true,
    roles: ["admin"]
  },
  {
    title: "Content Management",
    href: "/admin/content",
    description: "Manage dynamic content and pages",
    requiresAuth: true,
    roles: ["admin"]
  }
];

// CRM navigation
export const crmNavigation: NavigationItem[] = [
  {
    title: "CRM Dashboard",
    href: "/crm/dashboard",
    description: "Customer relationship management",
    requiresAuth: true
  },
  {
    title: "CRM Tasks",
    href: "/crm/tasks", 
    description: "Manage customer tasks and follow-ups",
    requiresAuth: true
  }
];

// Quick access navigation for authenticated users
export const quickAccessNavigation: NavigationItem[] = [
  {
    title: "Create",
    href: "/create",
    description: "Start creating now",
    requiresAuth: true
  },
  {
    title: "Marketplace",
    href: "/marketplace",
    description: "Browse designs"
  },
  {
    title: "My Account",
    href: "/dashboard",
    description: "Account overview",
    requiresAuth: true
  }
];

// Helper function to filter navigation based on user permissions
export const getFilteredNavigation = (
  items: NavigationItem[],
  user: User | null,
  profile: Profile | null
): NavigationItem[] => {
  return items.filter(item => {
    // If item requires auth but user is not authenticated
    if (item.requiresAuth && !user) return false;
    
    // If item has role requirements
    if (item.roles && item.roles.length > 0) {
      if (!profile) return false;
      
      return item.roles.some(role => {
        switch (role) {
          case 'admin': return profile.is_admin;
          case 'creator': return profile.is_creator;
          case 'artisan': return profile.is_artisan;
          case 'manufacturer': return profile.is_manufacturer;
          default: return false;
        }
      });
    }
    
    return true;
  });
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
    case 'admin':
      return profile.is_admin || false;
    default:
      return false;
  }
};

// Helper function to get all available routes for sitemap/search
export const getAllRoutes = (): string[] => {
  const routes: string[] = [];
  
  // Add public routes
  publicNavigation.forEach(item => routes.push(item.href));
  partnershipNavigation.forEach(item => routes.push(item.href));
  
  // Add authenticated routes
  authenticatedNavigation.forEach(item => routes.push(item.href));
  
  // Add role-specific routes
  roleNavigation.forEach(section => {
    section.items.forEach(item => routes.push(item.href));
  });
  
  // Add admin routes
  adminNavigation.forEach(item => routes.push(item.href));
  
  // Add CRM routes
  crmNavigation.forEach(item => routes.push(item.href));
  
  return [...new Set(routes)]; // Remove duplicates
};