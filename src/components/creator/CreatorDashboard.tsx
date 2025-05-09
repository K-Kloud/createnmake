
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductInventory } from "./ProductInventory";
import { SalesPerformance } from "./SalesPerformance";
import { CustomerMessages } from "./CustomerMessages";
import { CreatorEducation } from "./CreatorEducation";

interface CreatorDashboardProps {
  creatorId: string;
}

export const CreatorDashboard = ({ creatorId }: CreatorDashboardProps) => {
  const [activeTab, setActiveTab] = useState("inventory");

  const { data: profile } = useQuery({
    queryKey: ['creator-profile', creatorId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', creatorId)
        .single();
      return data;
    },
  });

  const { data: salesStats } = useQuery({
    queryKey: ['creator-sales', creatorId],
    queryFn: async () => {
      // Placeholder for actual sales data query
      return {
        totalSales: 0,
        pendingOrders: 0,
        revenue: 0
      };
    },
  });

  return (
    <main className="container px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">
          Creator Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats?.totalSales || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats?.pendingOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{salesStats?.revenue || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="education">Learning Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <ProductInventory creatorId={creatorId} />
        </TabsContent>

        <TabsContent value="sales">
          <SalesPerformance creatorId={creatorId} />
        </TabsContent>

        <TabsContent value="messages">
          <CustomerMessages creatorId={creatorId} />
        </TabsContent>

        <TabsContent value="education">
          <CreatorEducation />
        </TabsContent>
      </Tabs>
    </main>
  );
};
