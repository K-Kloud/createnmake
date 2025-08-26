import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManufacturerOrderDashboard } from "@/components/manufacturer/ManufacturerOrderDashboard";
import { ManufacturerOrderAnalytics } from "@/components/manufacturer/ManufacturerOrderAnalytics";

const ManufacturerOrders = () => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Please log in to view your orders.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Manage your quote requests and track your business performance
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ManufacturerOrderDashboard manufacturerId={session.user.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <ManufacturerOrderAnalytics manufacturerId={session.user.id} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ManufacturerOrders;