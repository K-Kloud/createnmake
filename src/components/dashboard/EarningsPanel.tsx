
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { EarningsSummary } from "./earnings/EarningsSummary";
import { EarningsChart } from "./earnings/EarningsChart";

export const EarningsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample data - in a real app you would fetch this from Supabase
  const earningsData = [
    { name: 'Jan', amount: 400 },
    { name: 'Feb', amount: 300 },
    { name: 'Mar', amount: 600 },
    { name: 'Apr', amount: 800 },
    { name: 'May', amount: 500 },
    { name: 'Jun', amount: 900 },
    { name: 'Jul', amount: 1100 },
  ];

  const totalEarnings = earningsData.reduce((acc, curr) => acc + curr.amount, 0);
  const lastMonth = earningsData[earningsData.length - 1].amount;
  const prevMonth = earningsData[earningsData.length - 2].amount;
  const percentageChange = ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);

  const handleViewAll = () => {
    navigate("/earnings");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Earnings</CardTitle>
        <Button variant="outline" size="sm" onClick={handleViewAll}>
          View Details
        </Button>
      </CardHeader>
      <CardContent>
        <EarningsSummary 
          totalEarnings={totalEarnings} 
          lastMonth={lastMonth} 
          percentageChange={percentageChange} 
        />
        <EarningsChart data={earningsData} />
      </CardContent>
    </Card>
  );
};
