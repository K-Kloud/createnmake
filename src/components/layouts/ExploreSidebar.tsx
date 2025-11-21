import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  User, 
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { SparkleIcon, GalleryIcon, DesignIcon, CreativeIcon } from "@/components/ui/custom-icons";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { id: "explore", label: "Explore", icon: GalleryIcon, href: "/explore-gallery" },
  { id: "create", label: "Create", icon: DesignIcon, href: "/" },
  { id: "generate", label: "Generate", icon: SparkleIcon, href: "/generate" },
  { id: "profile", label: "Profile", icon: User, href: "/dashboard", requiresAuth: true },
];

const bottomNavItems: NavItem[] = [
  { id: "help", label: "Help", icon: HelpCircle, href: "/support" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings", requiresAuth: true },
];

export const ExploreSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className={cn(
      "h-full bg-card text-foreground flex flex-col border-r border-border/50 transition-all duration-300 backdrop-blur-sm",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <SparkleIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              opentek
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-muted rounded-xl transition-all"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  active 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <Icon className={cn("h-5 w-5 flex-shrink-0", active && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border/50">
        <div className="space-y-1 px-3 py-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2",
            collapsed && "justify-center px-0"
          )}>
            <ThemeToggle />
            {!collapsed && <span className="text-sm text-muted-foreground font-medium">Theme</span>}
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="px-4 pb-4 space-y-2">
          {!user ? (
            <>
              {!collapsed && (
                <>
                  <Link to="/auth?mode=signup">
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg rounded-xl font-medium"
                    >
                      Sign Up
                    </Button>
                  </Link>
                  <Link to="/auth?mode=login">
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl font-medium border-border"
                    >
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              {!collapsed && (
                <Link to="/dashboard">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg rounded-xl font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
