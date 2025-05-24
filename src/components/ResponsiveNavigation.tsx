
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Menu, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  href: string;
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  className?: string;
}

export const ResponsiveNavigation = ({ 
  items,
  className = ""
}: ResponsiveNavigationProps) => {
  const { isAtLeast } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // If the screen is at least medium sized, render horizontal links
  if (isAtLeast('md')) {
    return (
      <nav className={`flex gap-6 ${className}`}>
        {items.map((item) => (
          <Link 
            key={item.href}
            to={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive(item.href) && "text-primary"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    );
  }

  // For smaller screens, render a mobile drawer menu
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] sm:w-[350px] pt-10">
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close navigation menu</span>
            </Button>
          </div>
          <nav className="flex flex-col space-y-4">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-2 py-3 text-lg font-medium hover:text-primary hover:bg-muted/50 rounded-md transition-colors",
                  isActive(item.href) && "text-primary bg-muted/50"
                )}
                onClick={handleItemClick}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
