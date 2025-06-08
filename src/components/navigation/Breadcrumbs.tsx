
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface BreadcrumbsProps {
  className?: string;
  customItems?: BreadcrumbItem[];
}

export const Breadcrumbs = ({ className, customItems }: BreadcrumbsProps) => {
  const location = useLocation();
  
  // Generate breadcrumbs from URL path if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { title: "Home", href: "/" }
    ];
    
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
        default:
          break;
      }
      
      breadcrumbs.push({
        title,
        href: currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  
  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}>
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index === 0 && <Home className="h-4 w-4 mr-1" />}
          
          {index < breadcrumbs.length - 1 ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.title}</span>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="h-4 w-4 mx-2" />
          )}
        </div>
      ))}
    </nav>
  );
};
