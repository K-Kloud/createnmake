
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useNotifications } from "@/context/NotificationContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Bell, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { LoadingState } from "@/components/ui/loading-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationType } from "@/types/notifications";

const ITEMS_PER_PAGE = 10;

const Notifications = () => {
  const { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Filter notifications based on selected type
  const filteredNotifications = filterType 
    ? notifications.filter(n => n.notification_type === filterType)
    : notifications;
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  
  // Get current page's notifications
  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const getNotificationIcon = (type: string) => {
    let className = "h-5 w-5";
    
    switch (type) {
      case NotificationType.SECURITY:
        return <Bell className={`${className} text-red-600`} />;
      case NotificationType.VERIFICATION:
        return <Check className={`${className} text-green-600`} />;
      case NotificationType.WELCOME:
        return <Bell className={`${className} text-blue-600`} />;
      case NotificationType.MILESTONE:
        return <Bell className={`${className} text-purple-600`} />;
      default:
        return <Bell className={`${className} text-gray-600`} />;
    }
  };
  
  const getNotificationTypeLabel = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container px-4 py-12 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
                : 'No unread notifications'}
            </p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterType === null}
                  onCheckedChange={() => setFilterType(null)}
                >
                  All types
                </DropdownMenuCheckboxItem>
                
                {Object.values(NotificationType).map(type => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={filterType === type}
                    onCheckedChange={() => setFilterType(type)}
                  >
                    {getNotificationTypeLabel(type)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsRead()}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        
        <LoadingState
          isLoading={isLoading}
          error={error}
          onRetry={refreshNotifications}
          loadingMessage="Loading your notifications..."
          errorMessage="Failed to load notifications"
        >
          <div className="space-y-4">
            {currentNotifications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p>
                    {filterType 
                      ? `You don't have any ${getNotificationTypeLabel(filterType).toLowerCase()} notifications.` 
                      : "You don't have any notifications yet."}
                  </p>
                  {filterType && (
                    <Button 
                      variant="link" 
                      onClick={() => setFilterType(null)} 
                      className="mt-2"
                    >
                      View all notifications
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              currentNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-colors ${!notification.is_read ? 'border-primary/50 bg-muted/30' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {notification.title}
                        </CardTitle>
                        {!notification.is_read && (
                          <Badge variant="default" className="ml-2">New</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="font-normal flex items-center gap-1">
                        {getNotificationIcon(notification.notification_type)}
                        {getNotificationTypeLabel(notification.notification_type)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{notification.message}</p>
                    
                    {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                      <div className="mt-4 p-3 bg-secondary rounded-md">
                        <h4 className="text-sm font-medium mb-1">Additional Information:</h4>
                        <div className="text-sm text-muted-foreground">
                          {Object.entries(notification.metadata).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium mr-2">{key.replace(/_/g, ' ')}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {!notification.is_read && (
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as read
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))
            )}
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <EnhancedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </LoadingState>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
