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
  UserPlus
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

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="h-full bg-[#1a1a1a] dark:bg-[#0f0f0f] text-white flex flex-col w-52 border-r border-white/10">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link to="/" className="text-xl font-bold">
          Midjourney
        </Link>
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
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
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
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Moon className="h-5 w-5 text-white/70" />
            <span className="text-sm text-white/70">Dark Mode</span>
            <div className="ml-auto">
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
                  className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                >
                  <LogIn className="h-5 w-5 mr-3" />
                  Log In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button 
                  className="w-full bg-[#f04e45] hover:bg-[#d94339] text-white"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              >
                <User className="h-5 w-5 mr-3" />
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
