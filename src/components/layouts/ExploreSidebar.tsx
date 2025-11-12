import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Compass, 
  Palette, 
  Image, 
  User, 
  Grid3x3, 
  FolderOpen,
  MessageSquare,
  HelpCircle,
  Bell,
  Moon,
  LogIn,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/header/ThemeToggle";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { id: "explore", label: "Explore", icon: Compass, href: "/explore-gallery" },
  { id: "create", label: "Create", icon: Palette, href: "/" },
  { id: "edit", label: "Edit", icon: Image, href: "/design" },
  { id: "personalize", label: "Personalize", icon: User, href: "/personalize" },
  { id: "moodboards", label: "Moodboards", icon: FolderOpen, href: "/collections" },
  { id: "organize", label: "Organize", icon: Grid3x3, href: "/organize" },
  { id: "surveys", label: "Surveys", icon: MessageSquare, href: "/surveys" },
];

const bottomNavItems: NavItem[] = [
  { id: "help", label: "Help", icon: HelpCircle, href: "/support" },
  { id: "updates", label: "Updates", icon: Bell, href: "/updates" },
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
      "h-full bg-[#1a1a1a] dark:bg-[#0f0f0f] text-white flex flex-col border-r border-white/10 transition-all duration-300",
      collapsed ? "w-16" : "w-52"
    )}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold">
            Midjourney
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active 
                    ? "bg-[#f04e45] text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-white/10">
        <div className="space-y-1 px-2 py-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5",
            collapsed && "justify-center px-0"
          )}>
            {!collapsed && (
              <>
                <Moon className="h-5 w-5 text-white/70" />
                <span className="text-sm text-white/70">Dark Mode</span>
              </>
            )}
            <div className={collapsed ? "" : "ml-auto"}>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="px-3 pb-4 space-y-2">
          {!user ? (
            <>
              <Link to="/auth?mode=login">
                <Button 
                  variant="ghost" 
                  size={collapsed ? "icon" : "default"}
                  className={cn(
                    "w-full text-white/70 hover:text-white hover:bg-white/10",
                    !collapsed && "justify-start"
                  )}
                  title={collapsed ? "Log In" : undefined}
                >
                  <LogIn className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && "Log In"}
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button 
                  size={collapsed ? "icon" : "default"}
                  className="w-full bg-[#f04e45] hover:bg-[#d94339] text-white"
                  title={collapsed ? "Sign Up" : undefined}
                >
                  <UserPlus className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && "Sign Up"}
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/dashboard">
              <Button 
                variant="ghost"
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "w-full text-white/70 hover:text-white hover:bg-white/10",
                  !collapsed && "justify-start"
                )}
                title={collapsed ? "Dashboard" : undefined}
              >
                <User className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && "Dashboard"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
