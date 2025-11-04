import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Package, Truck, Star } from 'lucide-react';
import { format } from 'date-fns';

interface RealTimeOrderTrackerProps {
  orderId: string;
  orderType: 'artisan' | 'manufacturer';
}

interface StatusHistory {
  id: string;
  old_status: string | null;
  new_status: string;
  created_at: string;
  notes: string | null;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'accepted', label: 'Order Accepted', icon: CheckCircle2 },
  { key: 'in_progress', label: 'In Production', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'completed', label: 'Delivered', icon: Star },
];

export const RealTimeOrderTracker = ({ orderId, orderType }: RealTimeOrderTrackerProps) => {
  const [currentStatus, setCurrentStatus] = useState<string>('pending');

  const { data: order } = useQuery({
    queryKey: ['order-detail', orderId, orderType],
    queryFn: async () => {
      const table = orderType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', parseInt(orderId))
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: statusHistory } = useQuery({
    queryKey: ['order-status-history', orderId, orderType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .eq('order_type', orderType)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as StatusHistory[];
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!orderId || !orderType) return;

    const table = orderType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
    
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new && 'status' in payload.new) {
            setCurrentStatus(payload.new.status as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, orderType]);

  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === currentStatus);
  };

  const getProgress = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / statusSteps.length) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Tracking</span>
          <Badge className={`${
            currentStatus === 'completed' ? 'bg-green-500' :
            currentStatus === 'cancelled' ? 'bg-red-500' :
            'bg-blue-500'
          }`}>
            {currentStatus?.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const currentIndex = getCurrentStepIndex();
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex items-start gap-4 ${
                  isCompleted ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                      {step.label}
                    </p>
                    {isCompleted && statusHistory && statusHistory[index] && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(statusHistory[index].created_at), 'MMM dd, HH:mm')}
                      </span>
                    )}
                  </div>
                  {isCurrent && statusHistory && statusHistory[index]?.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {statusHistory[index].notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {statusHistory && statusHistory.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Recent Updates</h4>
            <div className="space-y-2">
              {statusHistory.slice(-3).reverse().map((history) => (
                <div key={history.id} className="text-sm">
                  <div className="flex justify-between items-start">
                    <p>
                      Status changed to{' '}
                      <span className="font-medium">{history.new_status.replace('_', ' ')}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(history.created_at), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  {history.notes && (
                    <p className="text-muted-foreground mt-1">{history.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
