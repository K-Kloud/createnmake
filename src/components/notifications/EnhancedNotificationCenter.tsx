
import React, { useState } from 'react';
import { Bell, BellOff, Check, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeNotifications } from '@/components/notifications/RealtimeNotificationProvider';
import { formatDistanceToNow } from 'date-fns';
import { announceToScreenReader } from '@/utils/a11y';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'security':
      return <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20"><Bell className="h-4 w-4 text-red-600 dark:text-red-400" /></div>;
    case 'verification':
      return <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20"><Check className="h-4 w-4 text-green-600 dark:text-green-400" /></div>;
    case 'welcome':
      return <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20"><Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>;
    case 'milestone':
      return <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20"><Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>;
    case 're_engagement':
      return <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20"><Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /></div>;
    case 'recommendation':
      return <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/20"><Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div>;
    default:
      return <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"><Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" /></div>;
  }
};

export const EnhancedNotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();
  
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    announceToScreenReader("Notification marked as read");
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    announceToScreenReader("All notifications marked as read");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          {unreadCount > 0 ? (
            <>
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="text-lg font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              <Check className="h-4 w-4 mr-1" /> 
              Mark all read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-muted-foreground">
            <BellOff className="h-8 w-8 mb-3 opacity-40" />
            <p>No notifications yet</p>
            <p className="text-sm">We'll notify you when something important happens</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(80vh-10rem)] max-h-[400px]">
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 cursor-default flex items-start gap-3 ${
                    !notification.is_read ? 'bg-muted/40' : ''
                  }`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  {getNotificationIcon(notification.notification_type || 'default')}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
