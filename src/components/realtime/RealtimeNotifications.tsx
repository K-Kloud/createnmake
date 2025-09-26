import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const setupRealtimeNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Subscribe to real-time notifications
        const channel = supabase
          .channel(`notifications:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              const newNotification: Notification = {
                id: payload.new.id,
                type: payload.new.type || 'info',
                title: payload.new.title,
                message: payload.new.message,
                timestamp: new Date(payload.new.created_at),
                read: false,
                actionUrl: payload.new.action_url,
                metadata: payload.new.metadata
              };

              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);

              // Show toast for new notification
              toast({
                title: newNotification.title,
                description: newNotification.message,
                variant: newNotification.type === 'error' ? 'destructive' : 'default'
              });
            }
          )
          .on('broadcast', { event: 'system_notification' }, ({ payload }) => {
            const systemNotification: Notification = {
              id: `system-${Date.now()}`,
              type: payload.type || 'info',
              title: payload.title,
              message: payload.message,
              timestamp: new Date(),
              read: false,
              metadata: payload.metadata
            };

            setNotifications(prev => [systemNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            toast({
              title: systemNotification.title,
              description: systemNotification.message,
              variant: systemNotification.type === 'error' ? 'destructive' : 'default'
            });
          })
          .subscribe();

        // Load existing notifications
        loadNotifications();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Failed to setup realtime notifications:', error);
      }
    };

    setupRealtimeNotifications();
  }, [toast]);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This would load from a notifications table
      // For now, simulate some notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Image Generated',
          message: 'Your custom design has been generated successfully',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          actionUrl: '/gallery'
        },
        {
          id: '2',
          type: 'info',
          title: 'Quote Updated',
          message: 'Artisan has updated your quote request',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          actionUrl: '/quotes'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-0 border-b rounded-none ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-6"
                          >
                            Mark as read
                          </Button>
                        )}
                        {notification.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              markAsRead(notification.id);
                              // Navigate to action URL
                              window.location.href = notification.actionUrl!;
                            }}
                            className="text-xs h-6"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};