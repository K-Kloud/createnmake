import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useMakerEarningsSummary, useMakerEarnings } from "@/hooks/useMakerEarnings";
import { usePayoutSettings } from "@/hooks/usePayoutSettings";
import { EarningsOverview } from "./payouts/EarningsOverview";
import { PayoutHistory } from "./payouts/PayoutHistory";
import { PayoutSettings } from "./payouts/PayoutSettings";
import { EarningsBreakdown } from "./payouts/EarningsBreakdown";
import { Settings, DollarSign, History, TrendingUp } from "lucide-react";
import { useState } from "react";

export const MakerPayoutsPanel = () => {
  const { user } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useMakerEarningsSummary(user?.id);
  const { data: earnings, isLoading: earningsLoading } = useMakerEarnings(user?.id);
  const { settings } = usePayoutSettings(user?.id);
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payouts</h2>
          <p className="text-muted-foreground">
            Track your earnings and manage payout preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EarningsOverview 
            summary={summary} 
            isLoading={summaryLoading}
            settings={settings}
          />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <EarningsBreakdown 
            earnings={earnings || []}
            isLoading={earningsLoading}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <PayoutHistory makerId={user.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <PayoutSettings makerId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
