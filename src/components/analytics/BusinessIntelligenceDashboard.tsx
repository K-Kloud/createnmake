import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target, Calendar, Download, RefreshCw } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface CustomerMetric {
  segment: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface ConversionData {
  stage: string;
  users: number;
  conversionRate: number;
}

interface InventoryItem {
  category: string;
  stock: number;
  demand: number;
  reorderPoint: number;
  status: 'healthy' | 'low' | 'critical';
}

export const BusinessIntelligenceDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const revenueData: RevenueData[] = [
    { month: 'Jan', revenue: 45000, orders: 180, avgOrderValue: 250 },
    { month: 'Feb', revenue: 52000, orders: 208, avgOrderValue: 250 },
    { month: 'Mar', revenue: 48000, orders: 192, avgOrderValue: 250 },
    { month: 'Apr', revenue: 61000, orders: 244, avgOrderValue: 250 },
    { month: 'May', revenue: 55000, orders: 220, avgOrderValue: 250 },
    { month: 'Jun', revenue: 67000, orders: 268, avgOrderValue: 250 },
    { month: 'Jul', revenue: 74000, orders: 296, avgOrderValue: 250 },
    { month: 'Aug', revenue: 69000, orders: 276, avgOrderValue: 250 },
    { month: 'Sep', revenue: 78000, orders: 312, avgOrderValue: 250 },
    { month: 'Oct', revenue: 82000, orders: 328, avgOrderValue: 250 },
    { month: 'Nov', revenue: 88000, orders: 352, avgOrderValue: 250 },
    { month: 'Dec', revenue: 95000, orders: 380, avgOrderValue: 250 }
  ];

  const customerMetrics: CustomerMetric[] = [
    { segment: 'New Customers', value: 1250, change: 12.5, trend: 'up' },
    { segment: 'Returning Customers', value: 3480, change: 8.3, trend: 'up' },
    { segment: 'VIP Customers', value: 156, change: -2.1, trend: 'down' },
    { segment: 'Churn Risk', value: 89, change: -15.2, trend: 'down' }
  ];

  const conversionData: ConversionData[] = [
    { stage: 'Visitors', users: 10000, conversionRate: 100 },
    { stage: 'Product Views', users: 6500, conversionRate: 65 },
    { stage: 'Add to Cart', users: 1950, conversionRate: 30 },
    { stage: 'Checkout', users: 780, conversionRate: 40 },
    { stage: 'Purchase', users: 390, conversionRate: 50 }
  ];

  const inventoryData: InventoryItem[] = [
    { category: 'Dresses', stock: 245, demand: 180, reorderPoint: 200, status: 'healthy' },
    { category: 'Shirts', stock: 89, demand: 150, reorderPoint: 100, status: 'low' },
    { category: 'Pants', stock: 45, demand: 120, reorderPoint: 80, status: 'critical' },
    { category: 'Accessories', stock: 156, demand: 90, reorderPoint: 120, status: 'healthy' },
    { category: 'Shoes', stock: 78, demand: 110, reorderPoint: 75, status: 'healthy' }
  ];

  const categoryRevenueData = [
    { name: 'Dresses', value: 35, color: '#8B5CF6' },
    { name: 'Shirts', value: 25, color: '#06B6D4' },
    { name: 'Pants', value: 20, color: '#10B981' },
    { name: 'Accessories', value: 12, color: '#F59E0B' },
    { name: 'Shoes', value: 8, color: '#EF4444' }
  ];

  const clvData = [
    { segment: 'VIP', value: 850, customers: 156 },
    { segment: 'Loyal', value: 420, customers: 892 },
    { segment: 'Regular', value: 280, customers: 2340 },
    { segment: 'New', value: 150, customers: 1250 }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return null;
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'low': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Business Intelligence</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$234,567</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              +15.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,847</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              +8.7% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              +3.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,936</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              +12.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="clv">Lifetime Value</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                      name="Revenue ($)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--secondary-foreground))" 
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Distribution of revenue across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryRevenueData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerMetrics.map((metric) => (
              <Card key={metric.segment}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{metric.segment}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {getTrendIcon(metric.trend, metric.change)}
                    {Math.abs(metric.change)}% from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey through the purchase process</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="users" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryData.map((item) => (
              <Card key={item.category}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.category}</CardTitle>
                    <Badge 
                      variant={item.status === 'healthy' ? 'default' : item.status === 'low' ? 'secondary' : 'destructive'}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stock</p>
                      <p className={`font-medium ${getInventoryStatusColor(item.status)}`}>
                        {item.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Demand</p>
                      <p className="font-medium">{item.demand}/month</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reorder Point</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${
                            item.stock > item.reorderPoint ? 'bg-success' : 
                            item.stock > item.reorderPoint * 0.5 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${Math.min((item.stock / item.reorderPoint) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{item.reorderPoint}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Lifetime Value</CardTitle>
              <CardDescription>Average lifetime value by customer segment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={clvData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--primary))" name="CLV ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};