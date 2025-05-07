
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, BellOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export const NotificationIcon = ({ count = 0 }) => (
  <div className="relative">
    <Bell className="h-6 w-6" />
    {count > 0 && (
      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
        {count > 99 ? '99+' : count}
      </div>
    )}
  </div>
);

export function NotificationList() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching notifications",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Notification[];
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error marking notification as read",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    refetch();
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) {
      toast({
        title: "Error marking notifications as read",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    refetch();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <NotificationIcon count={unreadCount} />
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <BellOff className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  markAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

const NotificationItem = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (id: string) => Promise<void>;
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, h:mm a");
  };

  return (
    <Card
      className={cn(
        "border-0 border-b rounded-none hover:bg-muted/50 p-4",
        !notification.is_read && "bg-muted/20"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-2">
            {formatDate(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => markAsRead(notification.id)}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
      </div>
    </Card>
  );
};
