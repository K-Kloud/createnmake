
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "./auth/AuthDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./header/ThemeToggle";
import { UserMenu } from "./header/UserMenu";
import { EnhancedNotificationCenter } from "@/components/notifications/EnhancedNotificationCenter";
import { ResponsiveNavigation } from "./ResponsiveNavigation";
import { useResponsive } from "@/hooks/useResponsive";

export const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { isAtLeast } = useResponsive();

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['session'], session);
      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Main navigation items - only include valid routes
  const mainNav = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Features",
      href: "/features",
    },
    {
      title: "Create",
      href: "/create",
    },
    {
      title: "Marketplace",
      href: "/marketplace",
    },
  ];

  // Add authenticated user routes
  if (session?.user) {
    mainNav.push(
      {
        title: "Dashboard",
        href: "/dashboard",
      },
      {
        title: "Subscription",
        href: "/subscription",
      }
    );
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center">
            <button 
              className="bg-transparent text-primary border border-primary px-4 py-2 text-xl font-bold rounded-md hover:bg-primary/10 transition-all duration-200 hover:shadow-sm hover:shadow-primary/20 active:scale-95" 
              onClick={() => navigate("/")}
            >
              openteknologies
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <ResponsiveNavigation items={mainNav} />
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            
            {session?.user && (
              <EnhancedNotificationCenter />
            )}
            
            <div className={isAtLeast('sm') ? 'block' : 'hidden'}>
              <UserMenu 
                session={session} 
                profile={profile} 
                onShowAuthDialog={() => setShowAuthDialog(true)} 
              />
            </div>
            
            {/* Mobile navigation */}
            <div className="md:hidden">
              <ResponsiveNavigation items={mainNav} />
            </div>
          </div>
        </div>
      </header>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </>
  );
};
