
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "./auth/AuthDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./header/ThemeToggle";
import { UserMenu } from "./header/UserMenu";
import { EnhancedNotificationCenter } from "@/components/notifications/EnhancedNotificationCenter";
import { MainNavigationMenu } from "./navigation/NavigationMenu";
import { MobileNavigationMenu } from "./navigation/MobileNavigationMenu";
import { useResponsive } from "@/hooks/useResponsive";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAnalyticsContext } from "@/providers/AnalyticsProvider";
import { SmartNotificationSystem } from '@/components/notifications/SmartNotificationSystem';
import { NetworkStatusIndicator } from '@/components/enhancement/ProgressiveEnhancement';

export const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { isAtLeast } = useResponsive();
  const { t } = useTranslation('common');
  const { trackInteraction, trackFeatureUsage } = useAnalyticsContext();

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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogoClick = () => {
    trackInteraction('logo', 'header-logo', 'openteknologies');
    navigate("/");
  };

  const handleThemeToggle = (newMode: boolean) => {
    trackFeatureUsage('theme_toggle', 'appearance', { from: isDarkMode ? 'dark' : 'light', to: newMode ? 'dark' : 'light' });
    setIsDarkMode(newMode);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button 
            className="bg-transparent text-primary border border-primary px-4 py-2 text-xl font-bold rounded-md hover:bg-primary/10 transition-all duration-200 hover:shadow-sm hover:shadow-primary/20 active:scale-95" 
            onClick={handleLogoClick}
          >
            openteknologies
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
        <div className="flex items-center gap-4">
          <NetworkStatusIndicator />
          
          <div className="flex items-center gap-2">
            {session?.user && <SmartNotificationSystem />}
            <LanguageSwitcher />
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={handleThemeToggle} />
            
            {session?.user && (
              <EnhancedNotificationCenter />
            )}
            
            {/* Always render UserMenu - it handles both authenticated and non-authenticated states */}
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
