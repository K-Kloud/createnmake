
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, LineChart, Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <div className="flex items-end gap-1">
              <h3 className="text-2xl font-bold">${totalEarnings.toLocaleString()}</h3>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">This Month</p>
            <div className="flex items-end gap-1">
              <h3 className="text-2xl font-bold">${lastMonth.toLocaleString()}</h3>
              <span className={`text-xs pb-1 flex items-center ${Number(percentageChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Number(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
                {Number(percentageChange) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3 rotate-180" />}
              </span>
            </div>
          </div>
        </div>
        
        <div className="h-[180px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={earningsData}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Earnings']}
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: 'none', 
                  borderRadius: '4px',
                  color: '#fff' 
                }}
              />
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ffa3" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00ffa3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#00ffa3"
                fillOpacity={1}
                fill="url(#colorAmount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
