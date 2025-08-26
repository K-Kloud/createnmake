import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderRealtimeOptions {
  userId?: string;
  onOrderUpdate?: (payload: any) => void;
  onNewOrder?: (payload: any) => void;
}

export const useOrderRealtime = ({ 
  userId, 
  onOrderUpdate, 
  onNewOrder 
}: OrderRealtimeOptions = {}) => {
  const { toast } = useToast();

  const handleRealtimeUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    console.log('Order realtime update:', { eventType, newRecord, oldRecord });

    switch (eventType) {
      case 'INSERT':
        if (onNewOrder) {
          onNewOrder(payload);
        }
        if (newRecord.user_id === userId) {
          toast({
            title: "New Order Created",
            description: `Order #${newRecord.id.slice(-8)} has been created`,
            variant: "default"
          });
        }
        break;

      case 'UPDATE':
        if (onOrderUpdate) {
          onOrderUpdate(payload);
        }
        
        // Show status change notification if status changed
        if (oldRecord?.status !== newRecord?.status && newRecord.user_id === userId) {
          const statusMessages = {
            pending: 'is pending review',
            review: 'is being reviewed',
            completed: 'has been completed! 🎉',
            cancelled: 'has been cancelled',
            shipped: 'has been shipped! 📦',
            delivered: 'has been delivered! ✅'
          };

          const message = statusMessages[newRecord.status as keyof typeof statusMessages] 
            || `status updated to ${newRecord.status}`;

          toast({
            title: `Order #${newRecord.id.slice(-8)}`,
            description: `Your order ${message}`,
            variant: newRecord.status === 'cancelled' ? 'destructive' : 'default'
          });
        }
        break;
    }
  }, [userId, onOrderUpdate, onNewOrder, toast]);

  useEffect(() => {
    // Subscribe to artisan quotes changes
    const artisanChannel = supabase
      .channel('artisan-quotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artisan_quotes'
        },
        handleRealtimeUpdate
      )
      .subscribe();

    // Subscribe to manufacturer quote requests changes
    const manufacturerChannel = supabase
      .channel('quote-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests'
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(artisanChannel);
      supabase.removeChannel(manufacturerChannel);
    };
  }, [handleRealtimeUpdate]);

  return {
    // Could return any utility functions if needed
  };
};