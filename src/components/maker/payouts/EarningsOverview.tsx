import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsSummary, MakerPayoutSettings } from "@/types/payout";
import { DollarSign, TrendingUp, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EarningsOverviewProps {
  summary?: EarningsSummary;
  isLoading: boolean;
  settings?: MakerPayoutSettings | null;
}

export const EarningsOverview = ({ summary, isLoading, settings }: EarningsOverviewProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading earnings summary...</div>;
  }

  if (!summary) {
    return <div className="text-center py-8">No earnings data available</div>;
  }

  const stats = [
    {
      title: "Total Earnings",
      value: `$${summary.total_earnings.toFixed(2)}`,
      icon: DollarSign,
      description: "All-time earnings",
      color: "text-green-600",
    },
    {
      title: "Pending Payout",
      value: `$${summary.pending_earnings.toFixed(2)}`,
      icon: Clock,
      description: "Awaiting next payout cycle",
      color: "text-yellow-600",
    },
    {
      title: "Paid Out",
      value: `$${summary.paid_earnings.toFixed(2)}`,
      icon: TrendingUp,
      description: "Successfully transferred",
      color: "text-blue-600",
    },
    {
      title: "Next Payout",
      value: summary.next_payout_amount ? `$${summary.next_payout_amount.toFixed(2)}` : "N/A",
      icon: Calendar,
      description: summary.next_payout_date 
        ? formatDistanceToNow(new Date(summary.next_payout_date), { addSuffix: true })
        : "No scheduled payout",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{summary.total_orders}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">${summary.average_order_value.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="text-2xl font-bold">{summary.commission_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payout Frequency</p>
              <p className="text-2xl font-bold capitalize">
                {settings?.payout_frequency || 'Weekly'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
