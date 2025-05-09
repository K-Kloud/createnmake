
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesignsPanel } from "@/components/dashboard/DesignsPanel";
import { ProductsPanel } from "@/components/dashboard/ProductsPanel";
import { OrdersPanel } from "@/components/dashboard/OrdersPanel";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";

export const DashboardTabs = () => {
  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className="bg-background/50 backdrop-blur-sm">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="designs">Designs</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="earnings">Earnings</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <DesignsPanel />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrdersPanel />
          <EarningsPanel />
        </div>
      </TabsContent>

      <TabsContent value="designs">
        <DesignsPanel />
      </TabsContent>

      <TabsContent value="products">
        <ProductsPanel />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersPanel />
      </TabsContent>

      <TabsContent value="earnings">
        <EarningsPanel />
      </TabsContent>
    </Tabs>
  );
};
