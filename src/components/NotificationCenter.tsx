
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationSystem, Notification } from "@/hooks/useNotificationSystem";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export function NotificationCenter() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotificationSystem();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] min-h-[1.25rem] flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" side="bottom">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-medium text-lg">Notifications</h2>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[380px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={markAsRead} 
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
}) {
  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return '👋';
      case 'system':
        return '🔔';
      case 'security':
        return '🔒';
      case 'verification':
        return '✅';
      case 'order':
        return '🛍️';
      case 'payment':
        return '💰';
      default:
        return '📣';
    }
  };

  return (
    <li className={`p-4 ${!notification.is_read ? 'bg-muted/50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="text-xl">{getNotificationIcon(notification.notification_type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground"
                onClick={handleMarkAsRead}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </li>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="h-7 w-7 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
