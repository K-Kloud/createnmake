import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RecentPage {
  title: string;
  href: string;
  timestamp: number;
}

const MAX_RECENT_PAGES = 20;
const RECENT_PAGES_KEY = 'openteknologies_recent_pages';

// Page title mapping for better user experience
const getPageTitle = (pathname: string): string => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathname === '/') return 'Home';
  
  // Special mappings for better titles
  const titleMap: Record<string, string> = {
    '/marketplace': 'Marketplace',
    '/create': 'Create Design',
    '/designs': 'My Designs',
    '/dashboard': 'Dashboard', 
    '/products': 'Products',
    '/earnings': 'Earnings',
    '/orders': 'Orders',
    '/cart': 'Shopping Cart',
    '/settings': 'Settings',
    '/subscription': 'Pricing',
    '/system-monitoring': 'System Monitoring',
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/users': 'User Management',
    '/admin/system': 'System Management',
    '/admin/analytics': 'Analytics',
    '/admin/content': 'Content Management',
    '/creator/dashboard': 'Creator Dashboard',
    '/creator/onboarding': 'Creator Onboarding',
    '/creator/performance': 'Sales Performance',
    '/artisan/dashboard': 'Artisan Dashboard',
    '/artisan/orders': 'Artisan Orders',
    '/artisan/portfolio': 'Portfolio',
    '/manufacturer/dashboard': 'Manufacturer Dashboard',
    '/manufacturer/production': 'Production Queue',
    '/manufacturer/quality': 'Quality Control',
    '/crm/dashboard': 'CRM Dashboard',
    '/crm/tasks': 'CRM Tasks',
    '/faq': 'FAQ',
    '/contact': 'Contact Us',
    '/testimonials': 'Testimonials',
    '/features': 'Features',
    '/join-us': 'Join as Creator',
    '/join-artisan': 'Join as Artisan', 
    '/join-manufacturer': 'Join as Manufacturer',
    '/auth': 'Sign In',
    '/auth/callback': 'Authentication',
    '/reset-password': 'Reset Password'
  };

  if (titleMap[pathname]) {
    return titleMap[pathname];
  }

  // Handle dynamic routes
  if (pathSegments.includes('creator') && pathSegments.length > 2) {
    return 'Creator Profile';
  }
  if (pathSegments.includes('maker') && pathSegments.length > 1) {
    return 'Maker Profile';
  }
  if (pathSegments.includes('image') && pathSegments.length > 1) {
    return 'Image Details';
  }
  if (pathSegments.includes('order') && pathSegments.length > 1) {
    return 'Order Tracking';
  }

  // Fallback: capitalize last segment
  const lastSegment = pathSegments[pathSegments.length - 1];
  if (lastSegment) {
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  }

  return 'Page';
};

export const useRecentPages = () => {
  const location = useLocation();
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  // Load recent pages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_PAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentPages(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('Failed to load recent pages from localStorage:', error);
      setRecentPages([]);
    }
  }, []);

  // Add current page to recent pages when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const currentTitle = getPageTitle(currentPath);
    
    // Skip certain paths that shouldn't be in recent history
    const skipPaths = ['/auth', '/auth/callback', '/reset-password'];
    if (skipPaths.includes(currentPath)) {
      return;
    }

    setRecentPages(prevPages => {
      // Remove existing entry for this path if it exists
      const filteredPages = prevPages.filter(page => page.href !== currentPath);
      
      // Add current page to the beginning
      const newPages = [
        {
          title: currentTitle,
          href: currentPath,
          timestamp: Date.now()
        },
        ...filteredPages
      ].slice(0, MAX_RECENT_PAGES); // Keep only the most recent pages

      // Save to localStorage
      try {
        localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(newPages));
      } catch (error) {
        console.warn('Failed to save recent pages to localStorage:', error);
      }

      return newPages;
    });
  }, [location.pathname]);

  const clearRecentPages = () => {
    setRecentPages([]);
    try {
      localStorage.removeItem(RECENT_PAGES_KEY);
    } catch (error) {
      console.warn('Failed to clear recent pages from localStorage:', error);
    }
  };

  const removeRecentPage = (href: string) => {
    setRecentPages(prevPages => {
      const filteredPages = prevPages.filter(page => page.href !== href);
      
      try {
        localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(filteredPages));
      } catch (error) {
        console.warn('Failed to update recent pages in localStorage:', error);
      }
      
      return filteredPages;
    });
  };

  return {
    recentPages,
    clearRecentPages,
    removeRecentPage
  };
};