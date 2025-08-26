import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";
import { EnhancedOrderCard } from "@/components/orders/EnhancedOrderCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { ArtisanOrderAnalytics } from "./ArtisanOrderAnalytics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { OrderStatus } from "@/components/orders/OrderWorkflow";

interface Order {
  id: string;
  user_id: string;
  product_details: string;
  status: string;
  created_at: string;
  updated_at: string;
  amount?: number;
  payment_status?: string;
  type: 'artisan';
  customer_name?: string;
}

export const ArtisanOrderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Fetch artisan orders
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['artisan-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('artisan_quotes')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(order => ({
        id: order.id.toString(),
        user_id: order.user_id || '',
        product_details: order.product_details || '',
        status: order.status as OrderStatus,
        created_at: order.created_at,
        updated_at: order.updated_at,
        amount: order.amount,
        payment_status: order.payment_status,
        type: 'artisan' as const,
        customer_name: `Customer #${order.user_id?.slice(0, 8)}`,
        artisan_id: order.artisan_id,
        manufacturer_id: null,
        dimensions: order.dimensions,
        materials: order.materials,
        colors: order.colors,
        quantity: order.quantity,
        timeline_days: order.timeline_days,
        budget_range: order.budget_range,
        special_requirements: order.special_requirements,
        delivery_address: order.delivery_address,
        contact_preferences: order.contact_preferences,
        admin_notes: order.admin_notes,
        generated_image_url: order.generated_image_url,
        maker_name: `Artisan #${order.artisan_id?.slice(0, 8)}`,
        maker_avatar: null,
        progress_percentage: 0
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscriptions
  useOrderRealtime({
    onOrderUpdate: (order) => {
      queryClient.invalidateQueries({ queryKey: ['artisan-orders'] });
      toast({
        title: "Order Updated",
        description: `Order #${order.id} has been updated`,
      });
    },
    onNewOrder: (order) => {
      queryClient.invalidateQueries({ queryKey: ['artisan-orders'] });
      toast({
        title: "New Order Received!",
        description: `New order request: ${order.product_details?.substring(0, 50)}...`,
      });
    },
    userId: user?.id
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus, notes }: { orderId: string, newStatus: string, notes?: string }) => {
      const { error } = await supabase
        .from('artisan_quotes')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', parseInt(orderId))
        .eq('artisan_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisan-orders'] });
      toast({
        title: "Order Updated",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.product_details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, completed: 0, revenue: 0 };

    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length,
      revenue: orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0)
    };
  }, [orders]);

  const handleExportOrders = () => {
    if (!filteredOrders.length) return;

    const csvContent = [
      ['Order ID', 'Customer', 'Product Details', 'Status', 'Amount', 'Payment Status', 'Created At'],
      ...filteredOrders.map(order => [
        order.id,
        order.customer_name || 'Anonymous',
        order.product_details,
        order.status,
        order.amount || 0,
        order.payment_status || 'unpaid',
        new Date(order.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artisan-orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Dashboard</h1>
          <p className="text-muted-foreground">Manage your artisan orders and track performance</p>
        </div>
        <Button onClick={handleExportOrders} variant="outline" className="w-fit">
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter and search your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search orders, customers, or order IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(statusFilter !== "all" || paymentFilter !== "all" || searchTerm) && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setStatusFilter("all")}>
                      Status: {statusFilter} ×
                    </Badge>
                  )}
                  {paymentFilter !== "all" && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setPaymentFilter("all")}>
                      Payment: {paymentFilter} ×
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                      Search: "{searchTerm}" ×
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <EnhancedOrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={(newStatus: OrderStatus) => 
                    updateOrderStatus.mutate({ orderId: order.id, newStatus })
                  }
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <XCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "You haven't received any orders yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ArtisanOrderAnalytics orders={orders || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};