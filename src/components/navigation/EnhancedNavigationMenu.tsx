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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Search, Sparkles, Settings, User as UserIcon } from "lucide-react";
import {
  publicNavigation,
  partnershipNavigation,
  authenticatedNavigation,
  roleNavigation,
  adminNavigation,
  quickAccessNavigation,
  getFilteredNavigation,
  hasRoleAccess,
  NavigationItem,
  NavigationSection
} from "@/config/navigation";

interface NavigationMenuProps {
  user: User | null;
  profile: Profile | null;
  onShowAuthDialog: () => void;
}

export const EnhancedNavigationMenu = ({ user, profile, onShowAuthDialog }: NavigationMenuProps) => {
  const location = useLocation();
  const { t } = useTranslation('navigation');
  const [searchQuery, setSearchQuery] = useState("");
  
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
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium leading-none">{item.title}</div>
          {item.requiresAuth && !user && <Badge variant="outline" className="text-xs">Login Required</Badge>}
          {isActive(item.href) && <Badge variant="default" className="text-xs">Current</Badge>}
        </div>
        {item.description && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </Link>
    </NavigationMenuLink>
  );

  const renderRoleSection = (section: NavigationSection) => {
    if (!hasRoleAccess(section.title, user, profile)) return null;
    
    const accessibleItems = getFilteredNavigation(section.items, user, profile);
    if (accessibleItems.length === 0) return null;

    return (
      <div key={section.title} className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground px-3 flex items-center gap-2">
          {section.title === 'Creator' && <Sparkles className="h-3 w-3" />}
          {section.title === 'Admin' && <Settings className="h-3 w-3" />}
          {section.title === 'Artisan' && <UserIcon className="h-3 w-3" />}
          {t(`${section.title.toLowerCase()}.title`)}
          <Badge variant="secondary" className="text-xs">{accessibleItems.length}</Badge>
        </h4>
        <div className="space-y-1">
          {accessibleItems.map(renderNavigationLink)}
        </div>
      </div>
    );
  };

  // Filter items for search
  const allItems = [
    ...publicNavigation,
    ...authenticatedNavigation,
    ...roleNavigation.flatMap(section => section.items),
    ...adminNavigation
  ];
  
  const filteredSearchItems = searchQuery 
    ? getFilteredNavigation(allItems, user, profile).filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Quick Access for authenticated users */}
        {user && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-primary">Quick Access</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 md:w-[300px]">
                {getFilteredNavigation(quickAccessNavigation, user, profile).map(renderNavigationLink)}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* Explore Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>{t('explore.title')}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              {publicNavigation.map(renderNavigationLink)}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Partnership Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Join Us</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-1">
              {partnershipNavigation.map(renderNavigationLink)}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Create & Manage Menu - for authenticated users */}
        {user && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t('createManage.title')}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                {getFilteredNavigation(authenticatedNavigation, user, profile).map(renderNavigationLink)}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {/* Professional Tools Menu */}
        {user && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>{t('professionalTools.title')}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4 md:w-[500px] lg:w-[600px] space-y-4">
                {/* Search within professional tools */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tools and features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Show search results if searching */}
                {searchQuery && filteredSearchItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground px-3">Search Results</h4>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {filteredSearchItems.slice(0, 8).map(renderNavigationLink)}
                    </div>
                  </div>
                )}

                {/* Regular navigation sections when not searching */}
                {!searchQuery && (
                  <>
                    {roleNavigation.map(renderRoleSection)}
                    
                    {/* Admin section */}
                    {profile?.is_admin && (
                      <div className="space-y-2 border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground px-3 flex items-center gap-2">
                          <Settings className="h-3 w-3" />
                          {t('admin.title')}
                          <Badge variant="destructive" className="text-xs">Admin</Badge>
                        </h4>
                        <div className="space-y-1">
                          {getFilteredNavigation(adminNavigation, user, profile).map(renderNavigationLink)}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* No results message */}
                {searchQuery && filteredSearchItems.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No tools found for "{searchQuery}"</p>
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
            <Link to="/marketplace">{t('main.marketplace')}</Link>
          </Button>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Button 
            variant={isActive("/subscription") ? "default" : "ghost"} 
            asChild
            className={cn(
              isActive("/subscription") && "bg-primary text-primary-foreground"
            )}
          >
            <Link to="/subscription">{t('main.pricing')}</Link>
          </Button>
        </NavigationMenuItem>

        {/* Login prompt for non-authenticated users */}
        {!user && (
          <NavigationMenuItem>
            <Button 
              variant="outline" 
              onClick={onShowAuthDialog}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Sign In
            </Button>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};