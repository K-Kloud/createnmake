import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigationAccess } from '@/hooks/useNavigationAccess';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Lock } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  requires_auth: boolean;
  allowed_roles: string[];
  is_external?: boolean;
  target?: '_blank' | '_self';
  description?: string;
}

interface RoleBasedNavigationProps {
  items: NavigationItem[];
  className?: string;
  showAccessBadges?: boolean;
  variant?: 'horizontal' | 'vertical' | 'dropdown';
}

export const RoleBasedNavigation = ({
  items,
  className = '',
  showAccessBadges = false,
  variant = 'horizontal'
}: RoleBasedNavigationProps) => {
  const { hasAccess, filterByAccess, getUserRole, isAuthenticated } = useNavigationAccess();
  const location = useLocation();

  const accessibleItems = useMemo(() => {
    return filterByAccess(items);
  }, [items, filterByAccess]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getAccessBadge = (item: NavigationItem) => {
    if (!showAccessBadges) return null;

    if (item.requires_auth && !isAuthenticated) {
      return (
        <Badge variant="secondary" className="ml-2 text-xs">
          <Lock className="w-3 h-3 mr-1" />
          Login Required
        </Badge>
      );
    }

    if (item.allowed_roles.includes(getUserRole)) {
      return (
        <Badge variant="default" className="ml-2 text-xs">
          Available
        </Badge>
      );
    }

    return null;
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isCurrentlyActive = isActive(item.path);
    const canAccess = hasAccess(item);

    if (!canAccess && !showAccessBadges) {
      return null;
    }

    const content = (
      <>
        <span className={cn(
          "transition-colors",
          canAccess ? "text-foreground" : "text-muted-foreground"
        )}>
          {item.label}
        </span>
        {item.description && variant === 'dropdown' && (
          <span className="text-xs text-muted-foreground block">
            {item.description}
          </span>
        )}
        {getAccessBadge(item)}
        {variant === 'dropdown' && <ChevronRight className="w-4 h-4 ml-auto" />}
      </>
    );

    if (!canAccess) {
      return (
        <div
          key={item.id}
          className={cn(
            "opacity-50 cursor-not-allowed",
            variant === 'horizontal' && "text-sm font-medium",
            variant === 'vertical' && "px-3 py-2 rounded-md",
            variant === 'dropdown' && "px-2 py-1.5 text-sm rounded-sm"
          )}
        >
          {content}
        </div>
      );
    }

    if (item.is_external) {
      return (
        <a
          key={item.id}
          href={item.path}
          target={item.target || '_blank'}
          rel="noopener noreferrer"
          className={cn(
            "transition-colors hover:text-primary",
            variant === 'horizontal' && "text-sm font-medium",
            variant === 'vertical' && "block px-3 py-2 rounded-md hover:bg-accent",
            variant === 'dropdown' && "block px-2 py-1.5 text-sm rounded-sm hover:bg-accent",
            isCurrentlyActive && "text-primary bg-accent"
          )}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        className={cn(
          "transition-colors hover:text-primary",
          variant === 'horizontal' && "text-sm font-medium",
          variant === 'vertical' && "block px-3 py-2 rounded-md hover:bg-accent",
          variant === 'dropdown' && "block px-2 py-1.5 text-sm rounded-sm hover:bg-accent",
          isCurrentlyActive && "text-primary bg-accent"
        )}
      >
        {content}
      </Link>
    );
  };

  if (accessibleItems.length === 0 && !showAccessBadges) {
    return null;
  }

  return (
    <nav className={cn(
      variant === 'horizontal' && "flex items-center space-x-6",
      variant === 'vertical' && "flex flex-col space-y-1",
      variant === 'dropdown' && "flex flex-col space-y-0.5",
      className
    )}>
      {items.map(renderNavigationItem)}
    </nav>
  );
};