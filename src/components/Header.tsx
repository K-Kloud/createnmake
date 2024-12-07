import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "./auth/AuthDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  // TODO: Replace with actual auth state
  const isSignedIn = false;
  const user = {
    name: "John Doe",
    avatar: "https://github.com/shadcn.png",
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 
              className="text-2xl font-bold gradient-text cursor-pointer" 
              onClick={() => navigate("/")}
            >
              OpenT
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/gallery")}>
              Gallery
            </Button>
            <Button variant="ghost" onClick={() => navigate("/create")}>
              Create
            </Button>
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary-hover"
                onClick={() => setShowAuthDialog(true)}
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </>
  );
};