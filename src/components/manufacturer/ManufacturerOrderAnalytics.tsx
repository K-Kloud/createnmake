import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Target } from "lucide-react";

interface ManufacturerOrderAnalyticsProps {
  manufacturerId: string;
}

export const ManufacturerOrderAnalytics = ({ manufacturerId }: ManufacturerOrderAnalyticsProps) => {
  const { data: analyticsData } = useQuery({
    queryKey: ['manufacturer-analytics', manufacturerId],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('manufacturer_id', manufacturerId);

      if (error) {
        console.error('Error fetching analytics:', error);
        return null;
      }

      if (!orders || orders.length === 0) {
        return {
          totalRevenue: 0,
          totalOrders: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          monthlyData: [],
          statusDistribution: [],
          recentTrends: null
        };
      }

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      // Monthly data for the last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      const monthlyData = last6Months.map(date => {
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        });

        const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          orders: monthOrders.length,
          revenue: monthRevenue,
          completed: monthOrders.filter(o => o.status === 'completed').length
        };
      });

      // Status distribution
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        percentage: (count / totalOrders) * 100
      }));

      // Recent trends (comparing last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentOrders = orders.filter(order => new Date(order.created_at) >= thirtyDaysAgo);
      const previousOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
      });

      const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

      const revenueGrowth = previousRevenue > 0 ? 
        ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      const orderGrowth = previousOrders.length > 0 ? 
        ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

      const recentTrends = {
        revenueGrowth,
        orderGrowth,
        recentRevenue,
        recentOrders: recentOrders.length
      };

      return {
        totalRevenue,
        totalOrders,
        conversionRate,
        averageOrderValue,
        monthlyData,
        statusDistribution,
        recentTrends
      };
    },
    enabled: !!manufacturerId,
  });

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analyticsData.totalRevenue.toFixed(2)}</div>
            {analyticsData.recentTrends && (
              <p className={`text-xs flex items-center ${
                analyticsData.recentTrends.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.recentTrends.revenueGrowth >= 0 ? 
                  <TrendingUp className="h-3 w-3 mr-1" /> : 
                  <TrendingDown className="h-3 w-3 mr-1" />
                }
                {Math.abs(analyticsData.recentTrends.revenueGrowth).toFixed(1)}% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            {analyticsData.recentTrends && (
              <p className={`text-xs flex items-center ${
                analyticsData.recentTrends.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.recentTrends.orderGrowth >= 0 ? 
                  <TrendingUp className="h-3 w-3 mr-1" /> : 
                  <TrendingDown className="h-3 w-3 mr-1" />
                }
                {Math.abs(analyticsData.recentTrends.orderGrowth).toFixed(1)}% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</div>
            <Progress value={analyticsData.conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{analyticsData.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`£${value}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
                <Bar dataKey="completed" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm">{analyticsData.conversionRate.toFixed(1)}%</span>
            </div>
            <Progress value={analyticsData.conversionRate} />

            <div className="flex justify-between">
              <span className="text-sm font-medium">Recent Activity</span>
              <span className="text-sm">
                {analyticsData.recentTrends?.recentOrders || 0} orders this month
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium">Monthly Revenue</span>
              <span className="text-sm">
                £{analyticsData.recentTrends?.recentRevenue.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};