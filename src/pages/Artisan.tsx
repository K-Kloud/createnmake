
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layouts/PageLayout";
import { ArtisanDashboard } from "@/components/artisan/ArtisanDashboard";
import { PageHeader } from "@/components/common/PageHeader";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LoadingState } from "@/components/ui/loading-state";

const Artisan = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const { data: session, isLoading } = useQuery({
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
    <PageLayout 
      title="Artisan Dashboard | Create2Make"
      description="Manage your artisan business and connect with customers"
    >
      <LoadingState isLoading={isLoading}>
        {session?.user ? (
          <ArtisanDashboard artisanId={session.user.id} />
        ) : (
          <PageHeader 
            title="Please sign in to access the Artisan Dashboard"
            subtitle="Sign in to manage your artisan business and connect with customers"
          />
        )}
      </LoadingState>
    </PageLayout>
  );
};

export default Artisan;
