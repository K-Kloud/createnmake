import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesignsPanel } from "@/components/dashboard/DesignsPanel";
import { ProductsPanel } from "@/components/dashboard/ProductsPanel";
import { OrdersPanel } from "@/components/dashboard/OrdersPanel";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";
import { SmartRecommendations } from "@/components/automation/SmartRecommendations";
import { useAutonomousFeatures } from "@/hooks/useAutonomousFeatures";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UserImages } from "@/components/dashboard/UserImages";

export const DashboardTabs = ({ userId, userEmail, profile }: DashboardTabsProps) => {
  // Add autonomous features hook
  useAutonomousFeatures();

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-background/50 backdrop-blur-sm">
        <TabsTrigger value="overview">Dashboard</TabsTrigger>
        <TabsTrigger value="designs">Designs</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="earnings">Earnings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProfileCard profile={profile} userEmail={userEmail} userId={userId} />
          <DashboardStats userId={userId} />
          <QuickActions />
        </div>
        
        {/* Add Smart Recommendations */}
        <SmartRecommendations />
        
        <div className="grid gap-6 md:grid-cols-2">
          <UserImages userId={userId} />
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
