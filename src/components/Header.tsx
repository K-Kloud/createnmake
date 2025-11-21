import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "./auth/AuthDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./header/ThemeToggle";
import { NotificationCenter } from "./customer/NotificationCenter";
import { UserMenu } from "./header/UserMenu";
import { MainNavigationMenu } from "./navigation/NavigationMenu";
import { MobileNavigationMenu } from "./navigation/MobileNavigationMenu";
import { useResponsive } from "@/hooks/useResponsive";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAnalyticsContext } from "@/providers/AnalyticsProvider";
import { SmartNotificationSystem } from '@/components/notifications/SmartNotificationSystem';

export const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAtLeast } = useResponsive();
  const { t } = useTranslation('common');
  const { trackInteraction } = useAnalyticsContext();

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
      
      // Get basic profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) return null;

      // Check if user is a manufacturer
      const { data: manufacturerData } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // Check if user is an admin
      const { data: adminData } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      return {
        ...profileData,
        is_manufacturer: !!manufacturerData,
        is_admin: !!adminData
      };
    },
    enabled: !!session?.user?.id,
  });

  const handleLogoClick = () => {
    trackInteraction('logo', 'header-logo', 'openteknologies');
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button 
            className="group relative bg-transparent text-foreground px-5 py-2.5 text-lg font-bold rounded-xl hover:text-primary transition-all duration-300 active:scale-95 flex items-center gap-2" 
            onClick={handleLogoClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">open</span>
            <span className="relative">teknologies</span>
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <MainNavigationMenu 
            user={session?.user || null}
            profile={profile}
            onShowAuthDialog={() => setShowAuthDialog(true)}
          />
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {session?.user && <NotificationCenter />}
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* Always render UserMenu */}
            <div className={isAtLeast('sm') ? 'block' : 'hidden'}>
              <UserMenu 
                onShowAuthDialog={() => setShowAuthDialog(true)} 
              />
            </div>
            
            {/* Mobile navigation */}
            <div className="md:hidden">
              <MobileNavigationMenu 
                user={session?.user || null}
                profile={profile}
                onShowAuthDialog={() => setShowAuthDialog(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AuthDialog - always available but only opens when triggered */}
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </header>
  );
};
