import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { EnhancedOrderCard } from '@/components/orders/EnhancedOrderCard';
import { LoadingState } from '@/components/ui/loading-state';
import { OrderStatus } from '@/components/orders/OrderWorkflow';
import { formatDistanceToNow } from 'date-fns';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  topMakers: Array<{
    id: string;
    name: string;
    totalOrders: number;
    revenue: number;
  }>;
}

export const AdminOrderDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all orders with enhanced data
  const { data: orders, isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ['admin-orders', statusFilter, typeFilter, searchTerm],
    queryFn: async () => {
      const [artisanResult, manufacturerResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('quote_requests')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (artisanResult.error) throw artisanResult.error;
      if (manufacturerResult.error) throw manufacturerResult.error;

      const allOrders = [
        ...(artisanResult.data || []).map(o => ({
          ...o,
          id: o.id.toString(),
          type: 'artisan' as const,
          status: (o.status || 'pending') as OrderStatus,
          maker_name: `Artisan #${o.artisan_id?.slice(0, 8) || 'Unknown'}`,
          maker_avatar: null
        })),
        ...(manufacturerResult.data || []).map(o => ({
          ...o,
          id: o.id.toString(), 
          type: 'manufacturer' as const,
          status: (o.status || 'pending') as OrderStatus,
          maker_name: `Manufacturer #${o.manufacturer_id?.slice(0, 8) || 'Unknown'}`,
          maker_avatar: null
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply filters
      let filtered = allOrders;
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === statusFilter);
      }
      
      if (typeFilter !== 'all') {
        filtered = filtered.filter(o => o.type === typeFilter);
      }
      
      if (searchTerm) {
        filtered = filtered.filter(o => 
          o.product_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.maker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.id.includes(searchTerm)
        );
      }

      return filtered;
    },
  });

  // Calculate order statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async (): Promise<OrderStats> => {
      const [artisanResult, manufacturerResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('amount, status, artisan_id'),
        supabase
          .from('quote_requests')
          .select('status, manufacturer_id')
      ]);

      const allOrders = [
        ...(artisanResult.data || []),
        ...(manufacturerResult.data || []).map(o => ({...o, amount: null}))
      ];

      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, order: any) => sum + (order.amount || 0), 0);
      const pendingOrders = allOrders.filter((o: any) => o.status === 'pending').length;
      const completedOrders = allOrders.filter((o: any) => o.status === 'completed').length;
      const averageOrderValue = totalRevenue / (totalOrders || 1);

      // Calculate top makers
      const makerStats = new Map();
      
      allOrders.forEach((order: any) => {
        const makerId = order.artisan_id || order.manufacturer_id || 'unknown';
        const makerName = order.artisan_id ? 
          `Artisan #${order.artisan_id.slice(0, 8)}` : 
          `Manufacturer #${(order.manufacturer_id || 'unknown').slice(0, 8)}`;
        
        if (!makerStats.has(makerId)) {
          makerStats.set(makerId, {
            id: makerId,
            name: makerName,
            totalOrders: 0,
            revenue: 0
          });
        }
        
        const maker = makerStats.get(makerId);
        maker.totalOrders += 1;
        maker.revenue += order.amount || 0;
      });

      const topMakers = Array.from(makerStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        averageOrderValue,
        topMakers
      };
    },
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string, orderType: 'artisan' | 'manufacturer') => {
    const table = orderType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
    
    const { error } = await supabase
      .from(table)
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', parseInt(orderId));

    if (error) {
      console.error('Error updating status:', error);
    } else {
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Monitor and manage all orders across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">£{stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.completedOrders || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Makers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Makers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topMakers?.map((maker, index) => (
                  <div key={maker.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{maker.name}</p>
                        <p className="text-sm text-muted-foreground">{maker.totalOrders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">£{maker.revenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: £{(maker.revenue / maker.totalOrders).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">No data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="artisan">Artisan</SelectItem>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setSearchTerm('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <LoadingState
            isLoading={ordersLoading}
            error={null}
            loadingMessage="Loading orders..."
            errorMessage="Failed to load orders"
          >
            <div className="space-y-4">
              {orders?.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders found matching your filters.</p>
                  </CardContent>
                </Card>
              ) : (
                orders?.map((order) => (
                  <EnhancedOrderCard
                    key={`${order.type}-${order.id}`}
                    order={order}
                    onStatusUpdate={(newStatus) => 
                      handleStatusUpdate(order.id, newStatus, order.type)
                    }
                    isAdmin={true}
                    showMakerInfo={true}
                  />
                ))
              )}
            </div>
          </LoadingState>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Advanced analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};