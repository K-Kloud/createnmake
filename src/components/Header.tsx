
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/header/UserMenu";
import { Navigation } from "@/components/header/Navigation";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { Menu, X } from "lucide-react";
import { ResponsiveNavigation } from "./ResponsiveNavigation";

export const Header = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, session } = useAuth();
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === "dark";
  const setIsDarkMode = (value: boolean) => setTheme(value ? "dark" : "light");

  const navigationItems = [
    { title: "Home", href: "/" },
    { title: "Create", href: "/create" },
    { title: "Designs", href: "/designs" },
    { title: "Marketplace", href: "/marketplace" },
    { title: "Features", href: "/features" },
    { title: "Contact", href: "/contact" }
  ];

  const profile = session?.user ? {
    is_manufacturer: user?.user_metadata?.is_manufacturer || false,
    is_admin: user?.user_metadata?.is_admin || false,
    address: user?.user_metadata?.address || '',
    avatar_url: user?.user_metadata?.avatar_url || '',
    bio: user?.user_metadata?.bio || '',
    business_name: user?.user_metadata?.business_name || '',
    business_type: user?.user_metadata?.business_type || '',
    created_at: user?.created_at || '',
    creator_tier: user?.user_metadata?.creator_tier || 'free',
    id: user?.id || '',
    images_generated_count: user?.user_metadata?.images_generated_count || 0,
    is_artisan: user?.user_metadata?.is_artisan || false,
    is_creator: user?.user_metadata?.is_creator || false,
    monthly_image_limit: user?.user_metadata?.monthly_image_limit || 5,
    phone: user?.user_metadata?.phone || '',
    specialties: user?.user_metadata?.specialties || [],
    subscription_updated_at: user?.user_metadata?.subscription_updated_at || '',
    updated_at: user?.updated_at || '',
    username: user?.user_metadata?.username || ''
  } : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              StyleCraft AI
            </span>
          </a>
          <Navigation />
        </div>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <a className="mr-6 flex items-center space-x-2 md:hidden" href="/">
              <span className="font-bold">StyleCraft AI</span>
            </a>
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <UserMenu onShowAuthDialog={() => setShowAuthDialog(true)} />
          </nav>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="border-t md:hidden">
          <ResponsiveNavigation items={navigationItems} />
        </div>
      )}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </header>
  );
};
