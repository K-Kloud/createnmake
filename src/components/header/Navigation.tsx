
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <NavigationMenuLink asChild>
                <Link to="/marketplace" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">OpenMarket</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Discover and purchase unique designs from creators
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/designs" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">My Designs</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    View and manage your design collection
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/features" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Features</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Learn about our platform's capabilities
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/contact" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Contact</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Get in touch with our support team
                  </p>
                </Link>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Create</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[200px]">
              <NavigationMenuLink asChild>
                <Link to="/create" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">New Design</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Create a new AI-generated design
                  </p>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="text-sm font-medium leading-none">Dashboard</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Manage your account and creations
                  </p>
                </Link>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button variant="ghost" asChild>
            <Link to="/marketplace">OpenMarket</Link>
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
