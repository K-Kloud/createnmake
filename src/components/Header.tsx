
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "./auth/AuthDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "./header/Navigation";
import { ThemeToggle } from "./header/ThemeToggle";
import { UserMenu } from "./header/UserMenu";

export const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set dark mode as default

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['session'], session);
      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              className="bg-transparent text-primary border border-primary px-4 py-2 text-xl font-bold rounded-md hover:bg-primary/10 transition-all duration-200 hover:shadow-sm hover:shadow-primary/20 active:scale-95" 
              onClick={() => navigate("/")}
            >
              openteknologies
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <Navigation />
            <UserMenu 
              session={session} 
              profile={profile} 
              onShowAuthDialog={() => setShowAuthDialog(true)} 
            />
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
