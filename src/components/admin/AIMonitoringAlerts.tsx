import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Alert {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  metadata: any;
  created_at: string;
  is_read: boolean;
}

export const AIMonitoringAlerts = () => {
  const { toast } = useToast();

  // Get recent AI agent alerts
  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['ai-agent-alerts'],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .in('notification_type', ['ai_agent_alert', 'system_alert'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Set up real-time subscription for new alerts
  useEffect(() => {
    const channel = supabase
      .channel('ai-agent-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: 'notification_type=in.(ai_agent_alert,system_alert)'
        },
        (payload) => {
          console.log('New AI alert received:', payload);
          refetchAlerts();
          
          // Show toast notification
          toast({
            title: payload.new.title,
            description: payload.new.message,
            variant: payload.new.notification_type === 'system_alert' ? 'destructive' : 'default',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchAlerts, toast]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ai_agent_alert':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'ai_agent_alert':
        return 'outline' as const;
      case 'system_alert':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', alertId);
      
      refetchAlerts();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const unreadAlerts = alerts?.filter(alert => !alert.is_read) || [];
  const recentAlerts = alerts?.slice(0, 10) || [];

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      {unreadAlerts.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Active Alerts ({unreadAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unreadAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 bg-warning/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.notification_type)}
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {unreadAlerts.length > 3 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{unreadAlerts.length - 3} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent alerts</p>
              <p className="text-xs text-muted-foreground">All AI agents are running smoothly</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${alert.is_read ? 'opacity-60' : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.notification_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{alert.title}</span>
                        <Badge variant={getAlertVariant(alert.notification_type)} className="text-xs">
                          {alert.notification_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.created_at), 'HH:mm')}
                    </span>
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};