import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  parent_id?: string;
  order_index: number;
  requires_auth: boolean;
  allowed_roles: string[];
  is_active: boolean;
  metadata: any;
}

export const DynamicNavigation = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const location = useLocation();

  const { data: navItems, isLoading } = useQuery({
    queryKey: ['navigation-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return data as NavigationItem[];
    },
  });

  const hasAccess = (item: NavigationItem) => {
    if (!item.requires_auth) return true;
    if (!user) return false;
    
    if (item.allowed_roles?.length > 0) {
      return item.allowed_roles.some(role => {
        switch (role) {
          case 'admin': return profile?.is_admin;
          case 'creator': return profile?.is_creator;
          case 'artisan': return profile?.is_artisan;
          case 'manufacturer': return profile?.is_manufacturer;
          default: return true;
        }
      });
    }
    
    return true;
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  if (isLoading || !navItems) {
    return <div className="h-8 w-32 bg-muted animate-pulse rounded" />;
  }

  // Filter and organize navigation items
  const accessibleItems = navItems.filter(hasAccess);
  const topLevelItems = accessibleItems.filter(item => !item.parent_id);
  const childItems = accessibleItems.filter(item => item.parent_id);

  const getChildren = (parentId: string) => {
    return childItems.filter(item => item.parent_id === parentId);
  };

  const renderNavigationLink = (item: NavigationItem) => (
    <NavigationMenuLink asChild key={item.id}>
      <Link 
        to={item.path} 
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          isActive(item.path) && "bg-accent text-accent-foreground"
        )}
      >
        <div className="text-sm font-medium leading-none">{item.label}</div>
        {item.metadata?.description && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {item.metadata.description}
          </p>
        )}
      </Link>
    </NavigationMenuLink>
  );

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {topLevelItems.map((item) => {
          const children = getChildren(item.id);
          
          if (children.length > 0) {
            return (
              <NavigationMenuItem key={item.id}>
                <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    {children.map(renderNavigationLink)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.id}>
              <Button 
                variant={isActive(item.path) ? "default" : "ghost"} 
                asChild
                className={cn(
                  isActive(item.path) && "bg-primary text-primary-foreground"
                )}
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};