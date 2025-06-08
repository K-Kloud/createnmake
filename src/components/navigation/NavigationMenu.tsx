
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types/auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  publicNavigation,
  authenticatedNavigation,
  roleNavigation,
  adminNavigation,
  getFilteredNavigation,
  hasAccessToNavItem,
  NavigationItem,
  NavigationSection
} from "@/config/navigation";

interface NavigationMenuProps {
  user: User | null;
  profile: Profile | null;
  onShowAuthDialog: () => void;
}

export const MainNavigationMenu = ({ user, profile, onShowAuthDialog }: NavigationMenuProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const renderNavigationLink = (item: NavigationItem) => (
    <NavigationMenuLink asChild key={item.href}>
      <Link 
        to={item.href} 
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          isActive(item.href) && "bg-accent text-accent-foreground"
        )}
      >
        <div className="text-sm font-medium leading-none">{item.title}</div>
        {item.description && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </Link>
    </NavigationMenuLink>
  );

  const renderRoleSection = (section: NavigationSection) => {
    const accessibleItems = getFilteredNavigation(section.items, user, profile);
    if (accessibleItems.length === 0) return null;

    return (
      <div key={section.title} className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground px-3">{section.title}</h4>
        <div className="space-y-1">
          {accessibleItems.map(renderNavigationLink)}
        </div>
      </div>
    );
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Explore Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              {publicNavigation.map(renderNavigationLink)}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Create Menu - for authenticated users */}
        {user && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>Create & Manage</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                {getFilteredNavigation(authenticatedNavigation, user, profile).map(renderNavigationLink)}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* Role-specific menus */}
        {user && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>Professional Tools</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4 md:w-[500px] lg:w-[600px] space-y-4">
                {roleNavigation.map(renderRoleSection)}
                
                {/* Admin section */}
                {profile?.is_admin && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground px-3">Administration</h4>
                    <div className="space-y-1">
                      {adminNavigation.map(renderNavigationLink)}
                    </div>
                  </div>
                )}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* Direct links for key pages */}
        <NavigationMenuItem>
          <Button 
            variant={isActive("/marketplace") ? "default" : "ghost"} 
            asChild
            className={cn(
              isActive("/marketplace") && "bg-primary text-primary-foreground"
            )}
          >
            <Link to="/marketplace">Marketplace</Link>
          </Button>
        </NavigationMenuItem>

        {user ? (
          <NavigationMenuItem>
            <Button 
              variant={isActive("/subscription") ? "default" : "ghost"} 
              asChild
              className={cn(
                isActive("/subscription") && "bg-primary text-primary-foreground"
              )}
            >
              <Link to="/subscription">Pricing</Link>
            </Button>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <Button onClick={onShowAuthDialog}>
              Sign In
            </Button>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
