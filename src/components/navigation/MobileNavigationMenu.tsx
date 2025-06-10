
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/types/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  publicNavigation,
  authenticatedNavigation,
  roleNavigation,
  adminNavigation,
  getFilteredNavigation,
  NavigationItem,
  NavigationSection
} from "@/config/navigation";

interface MobileNavigationMenuProps {
  user: User | null;
  profile: Profile | null;
  onShowAuthDialog: () => void;
}

export const MobileNavigationMenu = ({ user, profile, onShowAuthDialog }: MobileNavigationMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation('navigation');

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const renderNavigationLink = (item: NavigationItem) => (
    <Link
      key={item.href}
      to={item.href}
      className={cn(
        "block px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
        isActive(item.href) && "bg-accent text-accent-foreground"
      )}
      onClick={handleLinkClick}
    >
      {item.title}
    </Link>
  );

  const renderRoleSection = (section: NavigationSection) => {
    const accessibleItems = getFilteredNavigation(section.items, user, profile);
    if (accessibleItems.length === 0) return null;

    return (
      <AccordionItem key={section.title} value={section.title.toLowerCase()}>
        <AccordionTrigger className="px-4 text-sm font-medium">
          {t(`${section.title.toLowerCase()}.title`)}
        </AccordionTrigger>
        <AccordionContent className="space-y-1 pb-2">
          {accessibleItems.map(renderNavigationLink)}
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>{t('main.navigation')}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Public Navigation */}
          <div className="space-y-1">
            <h4 className="px-4 text-sm font-medium text-muted-foreground mb-2">{t('explore.title')}</h4>
            {publicNavigation.map(renderNavigationLink)}
          </div>

          {/* Authenticated Navigation */}
          {user && (
            <div className="space-y-1 border-t pt-4">
              <h4 className="px-4 text-sm font-medium text-muted-foreground mb-2">{t('account.myAccount')}</h4>
              {getFilteredNavigation(authenticatedNavigation, user, profile).map(renderNavigationLink)}
            </div>
          )}

          {/* Role-specific Navigation */}
          {user && (
            <div className="border-t pt-4">
              <Accordion type="multiple" className="w-full">
                {roleNavigation.map(renderRoleSection)}
                
                {/* Admin Section */}
                {profile?.is_admin && (
                  <AccordionItem value="admin">
                    <AccordionTrigger className="px-4 text-sm font-medium">
                      {t('admin.title')}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-2">
                      {adminNavigation.map(renderNavigationLink)}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}

          {/* Authentication Button */}
          {!user && (
            <div className="border-t pt-4">
              <Button 
                onClick={() => {
                  onShowAuthDialog();
                  setIsOpen(false);
                }}
                className="w-full"
              >
                {t('account.signIn')}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
