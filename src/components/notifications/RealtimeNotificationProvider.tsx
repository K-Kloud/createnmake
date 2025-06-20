
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface RealtimeNotificationContextType {
  unreadCount: number;
  notifications: any[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const RealtimeNotificationContext = createContext<RealtimeNotificationContextType | null>(null);

export const useRealtimeNotifications = () => {
  const context = useContext(RealtimeNotificationContext);
  if (!context) {
    throw new Error("useRealtimeNotifications must be used within RealtimeNotificationProvider");
  }
  return context;
};

export const RealtimeNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch initial notifications
  useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
      
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for important notifications
          if (['milestone', 'engagement', 'subscription'].includes(newNotification.notification_type)) {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
          
          if (updatedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, toast]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;
    
    await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    
    setUnreadCount(0);
  };

  return (
    <RealtimeNotificationContext.Provider value={{
      unreadCount,
      notifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </RealtimeNotificationContext.Provider>
  );
};
