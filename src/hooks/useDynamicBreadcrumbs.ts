import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface BreadcrumbSegment {
  title: string;
  href: string | null;
}

export const useDynamicBreadcrumbs = () => {
  const location = useLocation();

  const { data: configs } = useQuery({
    queryKey: ['breadcrumb-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breadcrumb_configs')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [
      { title: "Home", href: "/" }
    ];

    // Check for custom breadcrumb configuration
    const matchedConfig = configs?.find(config => {
      const pattern = config.route_pattern.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(location.pathname);
    });

    if (matchedConfig && Array.isArray(matchedConfig.custom_segments)) {
      // Use custom configuration - safely cast the Json type
      const segments = matchedConfig.custom_segments as unknown as BreadcrumbSegment[];
      segments.forEach((segment) => {
        breadcrumbs.push({
          title: segment.title,
          href: segment.href
        });
      });
    } else {
      // Generate breadcrumbs from URL path
      let currentPath = "";
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        // Format segment title
        let title = segment.charAt(0).toUpperCase() + segment.slice(1);
        title = title.replace(/-/g, ' ');
        
        // Special cases for better naming
        switch (segment) {
          case "crm":
            title = "CRM";
            break;
          case "auth":
            title = "Sign In";
            break;
          case "faq":
            title = "FAQ";
            break;
          case "admin":
            title = "Admin";
            break;
          case "creator":
            title = index === 0 ? "Creator" : "Creator Profile";
            break;
          case "manufacturer":
            title = index === 0 ? "Manufacturer" : "Manufacturer Profile";
            break;
          default:
            break;
        }
        
        breadcrumbs.push({
          title,
          href: currentPath
        });
      });
    }
    
    return breadcrumbs;
  };

  return {
    breadcrumbs: generateBreadcrumbs(),
    isLoading: !configs
  };
};