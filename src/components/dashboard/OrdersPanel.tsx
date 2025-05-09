
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export const OrdersPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Query both artisan and manufacturer quotes
      const [artisanResult, quoteResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
          
        supabase
          .from('quote_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);
      
      if (artisanResult.error) throw artisanResult.error;
      if (quoteResult.error) throw quoteResult.error;
      
      // Combine and sort all orders
      const allOrders = [
        ...(artisanResult.data || []).map(o => ({...o, type: 'artisan'})),
        ...(quoteResult.data || []).map(o => ({...o, type: 'manufacturer'}))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return allOrders.slice(0, 5) || [];
    },
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    }
  };

  const handleViewAll = () => {
    navigate("/orders");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
        <Button variant="outline" size="sm" onClick={handleViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="w-full h-16 rounded-lg bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={`${order.type}-${order.id}`} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-card/50 cursor-pointer"
                onClick={() => navigate(`/orders/${order.type}/${order.id}`)}>
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.product_details?.substring(0, 30) || "Product Order"}</p>
                    <p className="text-xs text-muted-foreground">
                      Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg bg-card/30">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No orders yet</p>
            <Button onClick={() => navigate("/marketplace")} variant="link" className="mt-2">
              Explore marketplace
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
