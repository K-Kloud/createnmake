
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, Package, Truck, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'quality_check' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';

interface OrderWorkflowProps {
  orderId: string;
  currentStatus: OrderStatus;
  orderType: 'artisan' | 'manufacturer';
  onStatusUpdate?: (newStatus: OrderStatus) => void;
}

const orderSteps: Record<OrderStatus, { icon: React.ReactNode; label: string; description: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, label: 'Pending', description: 'Order received, awaiting confirmation' },
  confirmed: { icon: <CheckCircle className="h-4 w-4" />, label: 'Confirmed', description: 'Order confirmed, payment processed' },
  in_production: { icon: <Package className="h-4 w-4" />, label: 'In Production', description: 'Item being created' },
  quality_check: { icon: <Star className="h-4 w-4" />, label: 'Quality Check', description: 'Final quality inspection' },
  shipped: { icon: <Truck className="h-4 w-4" />, label: 'Shipped', description: 'Order dispatched for delivery' },
  delivered: { icon: <CheckCircle className="h-4 w-4" />, label: 'Delivered', description: 'Order delivered to customer' },
  completed: { icon: <CheckCircle className="h-4 w-4" />, label: 'Completed', description: 'Order completed successfully' },
  cancelled: { icon: <AlertCircle className="h-4 w-4" />, label: 'Cancelled', description: 'Order has been cancelled' },
  disputed: { icon: <AlertCircle className="h-4 w-4" />, label: 'Disputed', description: 'Order under dispute resolution' }
};

const getNextStatus = (current: OrderStatus): OrderStatus | null => {
  const flow: Record<OrderStatus, OrderStatus | null> = {
    pending: 'confirmed',
    confirmed: 'in_production',
    in_production: 'quality_check',
    quality_check: 'shipped',
    shipped: 'delivered',
    delivered: 'completed',
    completed: null,
    cancelled: null,
    disputed: null
  };
  return flow[current];
};

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    in_production: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    quality_check: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    shipped: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/30',
    completed: 'bg-green-600/10 text-green-600 border-green-600/30',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
    disputed: 'bg-gray-500/10 text-gray-500 border-gray-500/30'
  };
  return colors[status];
};

export const OrderWorkflow: React.FC<OrderWorkflowProps> = ({
  orderId,
  currentStatus,
  orderType,
  onStatusUpdate
}) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const table = orderType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
      const { error } = await supabase
        .from(table)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Log the status change
      await supabase.from('audit_logs').insert({
        action: 'order_status_update',
        action_details: {
          order_id: orderId,
          order_type: orderType,
          old_status: currentStatus,
          new_status: newStatus
        }
      });

      onStatusUpdate?.(newStatus);
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${orderSteps[newStatus].label}`,
      });

    } catch (error) {
      handleError(error, 'updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const nextStatus = getNextStatus(currentStatus);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {orderSteps[currentStatus].icon}
          Order Status: {orderSteps[currentStatus].label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(currentStatus)}>
            {orderSteps[currentStatus].label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {orderSteps[currentStatus].description}
          </span>
        </div>

        {nextStatus && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : `Move to ${orderSteps[nextStatus].label}`}
            </Button>
          </div>
        )}

        {(currentStatus === 'pending' || currentStatus === 'confirmed') && (
          <Button
            variant="destructive"
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={isUpdating}
            className="w-full"
          >
            Cancel Order
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
