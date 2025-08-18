import { Link } from "react-router-dom";
import { ChevronRight, Home, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDynamicBreadcrumbs } from "@/hooks/useDynamicBreadcrumbs";
import { useRecentPages } from "@/hooks/useRecentPages";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  title: string;
  href: string | null;
}

interface BreadcrumbsProps {
  className?: string;
  customItems?: BreadcrumbItem[];
  showRecentPages?: boolean;
}

export const EnhancedBreadcrumbs = ({ 
  className, 
  customItems, 
  showRecentPages = true 
}: BreadcrumbsProps) => {
  const { breadcrumbs: dynamicBreadcrumbs, isLoading } = useDynamicBreadcrumbs();
  const { recentPages, clearRecentPages } = useRecentPages();
  
  const breadcrumbs = customItems || dynamicBreadcrumbs;
  
  if (isLoading || breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  const handleBreadcrumbClick = (href: string) => {
    // Track breadcrumb navigation for analytics
    console.log('Breadcrumb navigation:', href);
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Main breadcrumb navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <div key={item.href || index} className="flex items-center">
            {index === 0 && <Home className="h-4 w-4 mr-1" />}
            
            {index < breadcrumbs.length - 1 && item.href ? (
              <Link
                to={item.href}
                onClick={() => handleBreadcrumbClick(item.href!)}
                className="hover:text-foreground transition-colors hover:underline decoration-dotted underline-offset-4"
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

      {/* Recent pages dropdown */}
      {showRecentPages && recentPages.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Clock className="h-4 w-4 mr-1" />
              Recent
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Recent Pages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentPages.slice(0, 8).map((page, index) => (
              <DropdownMenuItem key={index} asChild>
                <Link
                  to={page.href}
                  className="flex items-center justify-between w-full"
                  onClick={() => handleBreadcrumbClick(page.href)}
                >
                  <span className="truncate">{page.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(page.timestamp).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            
            {recentPages.length > 8 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-center text-muted-foreground"
                  disabled
                >
                  +{recentPages.length - 8} more pages
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={clearRecentPages}
              className="text-center text-destructive"
            >
              Clear History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};