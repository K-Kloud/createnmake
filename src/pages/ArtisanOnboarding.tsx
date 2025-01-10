import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArtisanOnboardingForm } from "@/components/artisan/ArtisanOnboardingForm";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ArtisanOnboarding = () => {
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

  const { data: profile, isLoading: isProfileLoading } = useQuery({
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

  // If user is already an artisan, redirect them to artisan dashboard
  useEffect(() => {
    if (profile?.is_artisan) {
      toast({
        title: "Already registered",
        description: "You are already registered as an artisan. Redirecting to dashboard...",
      });
      navigate('/artisan');
    }
  }, [profile, navigate, toast]);

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-24">
          <Card className="max-w-2xl mx-auto glass-card">
            <CardContent className="flex items-center justify-center p-6">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        <Card className="max-w-2xl mx-auto glass-card">
          {session?.user ? (
            <>
              <CardHeader>
                <CardTitle>Complete Your Artisan Profile</CardTitle>
                <CardDescription>
                  Tell us more about your craft and expertise to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArtisanOnboardingForm />
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Join as an Artisan</CardTitle>
                <CardDescription>
                  Create an account or sign in to start showcasing your craft and connecting with customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Join our community of skilled artisans and:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Showcase your unique creations</li>
                  <li>Connect with potential customers</li>
                  <li>Manage orders and communications</li>
                  <li>Grow your craft business</li>
                </ul>
                <Button 
                  className="w-full mt-4"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Sign In / Sign Up
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </main>
      <Footer />
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </div>
  );
};

export default ArtisanOnboarding;