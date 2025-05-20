
import { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  MessageCircle, 
  CalendarCheck, 
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationType } from '@/types/notifications';
import { announceToScreenReader } from '@/utils/a11y';

export const NotificationCenterPage = () => {
  const { notifications, markAsRead, markAllAsRead, isLoading, refreshNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('all');

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.notification_type === activeTab);
  };
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const handleClearAll = async () => {
    await markAllAsRead();
    announceToScreenReader("All notifications marked as read");
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.SECURITY:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case NotificationType.VERIFICATION:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case NotificationType.WELCOME:
        return <Bell className="h-5 w-5 text-blue-500" />;
      case NotificationType.MILESTONE:
        return <Award className="h-5 w-5 text-purple-500" />;
      case NotificationType.RE_ENGAGEMENT:
        return <CalendarCheck className="h-5 w-5 text-orange-500" />;
      case NotificationType.RECOMMENDATION:
        return <MessageCircle className="h-5 w-5 text-pink-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleClearAll}>
            Mark all as read
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-6">
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="milestone" className="hidden md:block">Milestones</TabsTrigger>
          <TabsTrigger value="re_engagement" className="hidden md:block">Updates</TabsTrigger>
          <TabsTrigger value="recommendation" className="hidden md:block">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : getFilteredNotifications().length === 0 ? (
            <Card className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Bell className="h-12 w-12 text-muted-foreground opacity-20" />
                <CardTitle>No notifications</CardTitle>
                <CardDescription>
                  You don't have any {activeTab !== 'all' ? activeTab : ''} notifications yet.
                </CardDescription>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredNotifications().map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition ${!notification.is_read ? 'bg-muted/50 border-primary/20' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-muted">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </span>
                        {!notification.is_read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 p-0 text-xs underline underline-offset-4"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{notification.message}</p>
                    {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                      <div className="mt-2 p-3 rounded bg-muted text-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(notification.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
