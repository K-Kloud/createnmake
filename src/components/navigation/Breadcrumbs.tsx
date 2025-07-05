
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDynamicBreadcrumbs } from "@/hooks/useDynamicBreadcrumbs";

interface BreadcrumbItem {
  title: string;
  href: string | null;
}

interface BreadcrumbsProps {
  className?: string;
  customItems?: BreadcrumbItem[];
}

export const Breadcrumbs = ({ className, customItems }: BreadcrumbsProps) => {
  const { breadcrumbs: dynamicBreadcrumbs, isLoading } = useDynamicBreadcrumbs();
  
  const breadcrumbs = customItems || dynamicBreadcrumbs;
  
  if (isLoading || breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}>
      {breadcrumbs.map((item, index) => (
        <div key={item.href || index} className="flex items-center">
          {index === 0 && <Home className="h-4 w-4 mr-1" />}
          
          {index < breadcrumbs.length - 1 && item.href ? (
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
