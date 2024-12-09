import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "./auth/AuthDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { ToggleLeft, ToggleRight } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const { toast } = useToast();
  const isSignedIn = false;
  const user = {
    name: "John Doe",
    avatar: "https://github.com/shadcn.png",
  };

  useEffect(() => {
    // Update the HTML class and localStorage when theme changes
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleSignOut = () => {
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: `${isDarkMode ? 'Light' : 'Dark'} mode activated`,
      description: `Switched to ${isDarkMode ? 'light' : 'dark'} theme.`,
    });
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 
              className="text-2xl font-bold text-primary animate-glow rounded-lg cursor-pointer" 
              onClick={() => navigate("/")}
            >
              OpenT
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 mr-2">
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-secondary"
              />
              {isDarkMode ? (
                <ToggleRight className="h-4 w-4 text-primary" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-primary" />
              )}
            </div>
            <Button variant="ghost" onClick={() => navigate("/marketplace")}>
              OpenMarket
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-500 focus:text-red-500"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary-hover"
                onClick={() => setShowAuthDialog(true)}
              >
                Sign In / Sign Up
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