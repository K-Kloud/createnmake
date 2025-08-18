import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useRealEarningsData } from "@/hooks/useRealEarningsData";
import { EarningsSummary } from "./EarningsSummary";
import { EarningsChart } from "./EarningsChart";
import { LoadingState } from "@/components/ui/loading-state";
import { 
  TrendingUp, 
  Download, 
  DollarSign, 
  Target,
  ArrowUpRight,
  Clock
} from "lucide-react";

export const EnhancedEarningsPanel = () => {
  const navigate = useNavigate();
  const { data: earningsData, isLoading, error } = useRealEarningsData();

  const handleViewAll = () => {
    navigate("/earnings");
  };

  const handleExportData = () => {
    // Export earnings data as CSV
    if (!earningsData) return;
    
    const csvData = earningsData.monthlyEarnings
      .map(row => `${row.name},${row.amount}`)
      .join('\n');
    
    const blob = new Blob([`Month,Earnings\n${csvData}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earnings-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <LoadingState isLoading={true} error={null}>
            <div>Loading earnings data...</div>
          </LoadingState>
        </CardContent>
      </Card>
    );
  }

  if (error || !earningsData) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Unable to load earnings data
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentMonth = earningsData.monthlyEarnings[earningsData.monthlyEarnings.length - 1]?.amount || 0;
  const previousMonth = earningsData.monthlyEarnings[earningsData.monthlyEarnings.length - 2]?.amount || 0;
  const percentageChange = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Main Earnings Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Earnings Dashboard</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewAll}>
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EarningsSummary 
            totalEarnings={earningsData.totalEarnings} 
            lastMonth={currentMonth} 
            percentageChange={percentageChange} 
          />
          <EarningsChart data={earningsData.monthlyEarnings} />
        </CardContent>
      </Card>

      {/* Earnings Sources & Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings Sources */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsData.earningsSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" style={{
                      backgroundColor: index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'
                    }} />
                    <span className="text-sm font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£{source.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {source.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projections */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Month Projection</span>
                <div className="text-right">
                  <div className="font-semibold">£{earningsData.projectedEarnings.toLocaleString()}</div>
                  <Badge variant={earningsData.growthRate >= 0 ? "default" : "destructive"}>
                    {earningsData.growthRate >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />
                    )}
                    {earningsData.growthRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Based on current growth trends
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earningsData.recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent transactions found
            </div>
          ) : (
            <div className="space-y-3">
              {earningsData.recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">{transaction.source}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£{transaction.amount.toLocaleString()}</div>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};