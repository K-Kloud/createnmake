
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreatorDashboard } from "@/components/creator/CreatorDashboard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/auth";

const CreatorDashboardPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile, isLoading } = useQuery<Profile>({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-24 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {session?.user && profile?.is_creator ? (
        <CreatorDashboard creatorId={session.user.id} />
      ) : (
        <main className="container px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 gradient-text">
              Become a Creator
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              {session?.user 
                ? "Complete your creator profile to start selling your designs on our marketplace."
                : "Sign in and create a creator profile to start selling your designs."}
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/creator/onboarding')}
            >
              {session?.user ? "Complete Your Profile" : "Get Started"}
            </Button>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
};

export default CreatorDashboardPage;
