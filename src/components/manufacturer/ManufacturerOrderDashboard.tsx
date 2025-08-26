import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, DollarSign, Package, TrendingUp } from "lucide-react";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";
import { useToast } from "@/components/ui/use-toast";

interface ManufacturerOrderDashboardProps {
  manufacturerId: string;
}

export const ManufacturerOrderDashboard = ({ manufacturerId }: ManufacturerOrderDashboardProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  const { data: orders, refetch } = useQuery({
    queryKey: ['manufacturer-orders', manufacturerId, statusFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('quote_requests')
        .select(`
          *,
          profiles(username)
        `)
        .eq('manufacturer_id', manufacturerId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.order(sortBy, { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!manufacturerId,
  });

  // Set up real-time updates
  useOrderRealtime({
    userId: manufacturerId,
    onOrderUpdate: () => {
      refetch();
    },
    onNewOrder: () => {
      refetch();
    }
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
      refetch();
    }
  };

  const filteredOrders = orders?.filter(order =>
    order.product_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const statusCounts = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    review: orders?.filter(o => o.status === 'review').length || 0,
    accepted: orders?.filter(o => o.status === 'accepted').length || 0,
    completed: orders?.filter(o => o.status === 'completed').length || 0
  };

  const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'review': return 'bg-blue-500/10 text-blue-500';
      case 'accepted': return 'bg-green-500/10 text-green-500';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.review}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="glass-card p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        Order #{String(order.id).slice(-8)}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Customer: {order.profiles?.username || 'Anonymous'}
                    </p>
                    
                    <p className="text-sm mb-2">
                      {order.product_details}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                      {order.amount && <span>Amount: £{order.amount}</span>}
                      {order.quantity && <span>Quantity: {order.quantity}</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(String(order.id), 'review')}
                        >
                          Start Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(String(order.id), 'accepted')}
                        >
                          Accept
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'review' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(String(order.id), 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(String(order.id), 'cancelled')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'accepted' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(String(order.id), 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};