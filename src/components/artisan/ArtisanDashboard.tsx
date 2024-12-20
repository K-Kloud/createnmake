import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtisanQuotes } from "./ArtisanQuotes";
import { ArtisanOverview } from "./ArtisanOverview";

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
        </TabsList>

        <TabsContent value="overview">
          <ArtisanOverview artisan={profile} />
        </TabsContent>

        <TabsContent value="quotes">
          <ArtisanQuotes artisanId={artisanId} />
        </TabsContent>
      </Tabs>
    </main>
  );
};