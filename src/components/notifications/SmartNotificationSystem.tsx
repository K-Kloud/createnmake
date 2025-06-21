
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, Settings, Filter, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPreferences {
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
  categories: Record<string, boolean>;
}

export const SmartNotificationSystem: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    sound: true,
    desktop: true,
    email: false,
    push: true,
    categories: {
      security: true,
      milestone: true,
      welcome: false,
      system: true,
    }
  });
  const [filter, setFilter] = useState<string>('all');
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotificationSystem();
  const { toast } = useToast();

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Smart notification batching and debouncing
  const [notificationQueue, setNotificationQueue] = useState<any[]>([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notificationQueue.length > 0) {
        // Show desktop notification for batched notifications
        if (preferences.desktop && Notification.permission === 'granted') {
          const count = notificationQueue.length;
          new Notification(
            count === 1 ? notificationQueue[0].title : `${count} new notifications`,
            {
              body: count === 1 ? notificationQueue[0].message : 'Click to view all notifications',
              icon: '/favicon.ico',
              tag: 'batch-notification'
            }
          );
        }
        setNotificationQueue([]);
      }
    }, 2000); // Batch notifications for 2 seconds

    return () => clearTimeout(timer);
  }, [notificationQueue, preferences.desktop]);

  // Smart filtering
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'today') {
      const today = new Date();
      const notificationDate = new Date(notification.created_at);
      return notificationDate.toDateString() === today.toDateString();
    }
    if (filter !== 'all') return notification.notification_type === filter;
    return true;
  });

  // Smart notification actions
  const handleSmartAction = useCallback(async (notification: any, action: string) => {
    switch (action) {
      case 'snooze':
        // Implement snooze functionality
        toast({
          title: "Notification snoozed",
          description: "You'll be reminded in 1 hour",
        });
        break;
      case 'archive':
        await deleteNotification(notification.id);
        break;
      case 'mark-important':
        // Could implement importance marking
        toast({
          title: "Marked as important",
          description: "This notification will be prioritized",
        });
        break;
    }
  }, [deleteNotification, toast]);

  const getNotificationPriority = (notification: any) => {
    const highPriority = ['security', 'milestone', 'verification'];
    return highPriority.includes(notification.notification_type) ? 'high' : 'normal';
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      security: <div className="w-2 h-2 bg-red-500 rounded-full" />,
      milestone: <div className="w-2 h-2 bg-purple-500 rounded-full" />,
      welcome: <div className="w-2 h-2 bg-blue-500 rounded-full" />,
      system: <div className="w-2 h-2 bg-gray-500 rounded-full" />,
    };
    return iconMap[type] || <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 animate-pulse" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desktop notifications</span>
                      <Switch
                        checked={preferences.desktop}
                        onCheckedChange={(checked) =>
                          setPreferences(prev => ({ ...prev, desktop: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sound alerts</span>
                      <Switch
                        checked={preferences.sound}
                        onCheckedChange={(checked) =>
                          setPreferences(prev => ({ ...prev, sound: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  {['all', 'unread', 'today', 'security', 'milestone', 'system'].map((filterOption) => (
                    <Button
                      key={filterOption}
                      variant={filter === filterOption ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setFilter(filterOption)}
                    >
                      {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-0 border-b rounded-none hover:bg-muted/50 transition-colors ${
                    !notification.is_read ? 'bg-muted/20 border-l-2 border-l-primary' : ''
                  } ${getNotificationPriority(notification) === 'high' ? 'border-l-orange-500' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.notification_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        
                        {!notification.is_read && (
                          <div className="flex items-center gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark read
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSmartAction(notification, 'snooze')}
                            >
                              Snooze
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
