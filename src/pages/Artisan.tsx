import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArtisanDashboard } from "@/components/artisan/ArtisanDashboard";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const Artisan = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Payment Canceled",
        description: "The payment process was canceled.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {session?.user ? (
        <ArtisanDashboard artisanId={session.user.id} />
      ) : (
        <main className="container px-4 py-24">
          <h1 className="text-4xl font-bold mb-8 gradient-text">
            Please sign in to access the Artisan Dashboard
          </h1>
        </main>
      )}
      <Footer />
    </div>
  );
};

export default Artisan;