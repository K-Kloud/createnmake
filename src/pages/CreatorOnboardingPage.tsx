
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CreatorOnboarding } from "@/components/creator/CreatorOnboarding";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/auth";

const CreatorOnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery<Profile>({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null as unknown as Profile;
      
      // Get basic profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) return null as unknown as Profile;

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
      } as Profile;
    },
    enabled: !!session?.user?.id,
  });

  // If user is already a creator, redirect them to creator dashboard
  useEffect(() => {
    if (profile?.is_creator) {
      toast({
        title: "Already registered",
        description: "You are already registered as a creator. Redirecting to dashboard...",
      });
      navigate('/creator/dashboard');
    }
  }, [profile, navigate, toast]);

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-24">
          <div className="flex items-center justify-center p-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        {session?.user ? (
          <CreatorOnboarding />
        ) : (
          <div className="max-w-2xl mx-auto glass-card p-6">
            <h2 className="text-2xl font-bold mb-4">Join as a Creator</h2>
            <p className="mb-6 text-muted-foreground">
              Sign in or create an account to start selling your designs in our marketplace.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
              <li>Showcase your creative designs to a global audience</li>
              <li>Set your own prices and earn from your creativity</li>
              <li>Connect with artisans and manufacturers to bring designs to life</li>
              <li>Build your brand and reputation in our creative community</li>
            </ul>
            <Button 
              className="w-full"
              onClick={() => setShowAuthDialog(true)}
            >
              Sign In / Sign Up
            </Button>
          </div>
        )}
      </main>
      <Footer />
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </div>
  );
};

export default CreatorOnboardingPage;
