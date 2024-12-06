import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "./auth/AuthDialog";

export const Header = () => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold gradient-text">OpenT</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/gallery")}>
              Gallery
            </Button>
            <Button variant="ghost" onClick={() => navigate("/create")}>
              Create
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-hover"
              onClick={() => setShowAuthDialog(true)}
            >
              Sign In
            </Button>
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