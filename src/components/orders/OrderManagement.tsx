
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderWorkflow, OrderStatus } from './OrderWorkflow';
import { EnhancedOrderCard } from './EnhancedOrderCard';
import { LoadingState } from '@/components/ui/loading-state';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  user_id: string | null;
  product_details: string;
  amount?: number | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  type: 'artisan' | 'manufacturer';
  artisan_id?: string | null;
  manufacturer_id?: string | null;
}

export const OrderManagement: React.FC = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const [artisanResult, manufacturerResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('quote_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (artisanResult.error) throw artisanResult.error;
      if (manufacturerResult.error) throw manufacturerResult.error;

      const allOrders: Order[] = [
        ...(artisanResult.data || []).map(o => ({ 
          ...o, 
          id: o.id.toString(),
          type: 'artisan' as const,
          status: (o.status || 'pending') as OrderStatus,
          maker_name: `Professional Artisan #${o.artisan_id?.slice(0, 8) || 'Unknown'}`,
          maker_avatar: null
        })),
        ...(manufacturerResult.data || []).map(o => ({ 
          ...o, 
          id: o.id.toString(),
          type: 'manufacturer' as const,
          status: (o.status || 'pending') as OrderStatus,
          maker_name: `Professional Manufacturer #${o.manufacturer_id?.slice(0, 8) || 'Unknown'}`,
          maker_avatar: null
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return allOrders;
    },
    enabled: !!user?.id,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus, orderType }: { 
      orderId: string; 
      newStatus: OrderStatus; 
      orderType: 'artisan' | 'manufacturer' 
    }) => {
      const table = orderType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', parseInt(orderId));

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      handleError(error, 'updating order status');
    }
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Please sign in to view your orders.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState
            isLoading={isLoading}
            error={error}
            loadingMessage="Loading your orders..."
            errorMessage="Failed to load orders"
          >
            {orders && orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders found.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/marketplace'}>
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders?.map((order) => (
                  <EnhancedOrderCard
                    key={`${order.type}-${order.id}`}
                    order={order}
                    onStatusUpdate={(newStatus) => {
                      updateOrderStatus.mutate({
                        orderId: order.id,
                        newStatus,
                        orderType: order.type
                      });
                    }}
                    showMakerInfo={true}
                  />
                ))}
              </div>
            )}
          </LoadingState>
        </CardContent>
      </Card>
    </div>
  );
};
