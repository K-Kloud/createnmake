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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button
            className="group flex items-center gap-2 px-1 py-1.5 transition-colors hover:text-primary"
            onClick={handleLogoClick}
            aria-label="Openteknologies — Home"
          >
            <span
              aria-hidden
              className="w-5 h-5 bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)] transition-transform duration-300 group-hover:rotate-45"
            />
            <span className="font-mono text-sm tracking-[0.2em] uppercase text-foreground">
              openteknologies
            </span>
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
        <div className="flex items-center gap-2">
          {session?.user && <NotificationCenter />}
          <LanguageSwitcher />
          <ThemeToggle />

          <div className={isAtLeast('sm') ? 'block' : 'hidden'}>
            <UserMenu onShowAuthDialog={() => setShowAuthDialog(true)} />
          </div>

          <div className="md:hidden">
            <MobileNavigationMenu
              user={session?.user || null}
              profile={profile}
              onShowAuthDialog={() => setShowAuthDialog(true)}
            />
          </div>
        </div>
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </header>
  );
};
