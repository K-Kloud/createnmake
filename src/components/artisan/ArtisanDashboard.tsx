import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtisanQuotes } from "./ArtisanQuotes";
import { ArtisanOverview } from "./ArtisanOverview";
import { MakerPayoutsPanel } from "@/components/maker/MakerPayoutsPanel";

interface ArtisanDashboardProps {
  artisanId: string;
}

export const ArtisanDashboard = ({ artisanId }: ArtisanDashboardProps) => {
  const { data: profile } = useQuery({
    queryKey: ['artisan', artisanId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', artisanId)
        .single();
      return data;
    },
  });

  const { data: quoteStats } = useQuery({
    queryKey: ['artisan-quote-stats', artisanId],
    queryFn: async () => {
      const { data: quotes } = await supabase
        .from('artisan_quotes')
        .select('status, payment_status')
        .eq('artisan_id', artisanId);

      if (!quotes) return { requested: 0, accepted: 0, completed: 0 };

      return {
        requested: quotes.length,
        accepted: quotes.filter(q => q.status === 'quoted').length,
        completed: quotes.filter(q => q.payment_status === 'paid').length,
      };
    },
  });

  return (
    <main className="container px-4 py-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">
          Artisan Dashboard
        </h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ArtisanOverview artisan={profile} stats={quoteStats} />
        </TabsContent>

        <TabsContent value="quotes">
          <ArtisanQuotes artisanId={artisanId} />
        </TabsContent>

        <TabsContent value="payouts">
          <MakerPayoutsPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
};