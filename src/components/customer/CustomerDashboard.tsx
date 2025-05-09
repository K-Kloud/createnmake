
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerPurchases } from "./CustomerPurchases";
import { CustomerWishlist } from "./CustomerWishlist";
import { CustomerMessages } from "./CustomerMessages";
import { CustomerTutorials } from "./CustomerTutorials";

interface CustomerDashboardProps {
  customerId: string;
}

export const CustomerDashboard = ({ customerId }: CustomerDashboardProps) => {
  const { data: profile } = useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();
      return data;
    },
  });

  return (
    <main className="container px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold gradient-text">
          Customer Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wishlisted Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <CustomerPurchases customerId={customerId} />
        </TabsContent>

        <TabsContent value="wishlist">
          <CustomerWishlist customerId={customerId} />
        </TabsContent>

        <TabsContent value="messages">
          <CustomerMessages customerId={customerId} />
        </TabsContent>

        <TabsContent value="tutorials">
          <CustomerTutorials />
        </TabsContent>
      </Tabs>
    </main>
  );
};
