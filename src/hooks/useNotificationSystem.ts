
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  deleted_at?: string;
}

function normalizeMetadata(meta: any): Record<string, any> | undefined {
  // Only return objects and arrays, or undefined otherwise
  if (meta && typeof meta === 'object') return meta as Record<string, any>;
  return undefined;
}

function filterActiveNotifications(notifications: Notification[]) {
  return notifications.filter(n => !n.deleted_at);
}

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)  // Only get non-deleted notifications
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Patch: normalize metadata for type compatibility
        const notificationsSafe: Notification[] = (data || []).map((n: any) => ({
          ...n,
          metadata: normalizeMetadata(n.metadata),
          is_read: !!n.is_read,
          deleted_at: n.deleted_at,
        }));

        setNotifications(filterActiveNotifications(notificationsSafe));
        setUnreadCount(filterActiveNotifications(notificationsSafe).filter(n => !n.is_read).length);
      } catch (error: any) {
        console.error('Error fetching notifications:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Add new notification to state
          const newNotification = payload.new as Notification;
          
          // Skip deleted notifications
          if (newNotification.deleted_at) return;
          
          setNotifications(prev => [
            {
              ...newNotification,
              metadata: normalizeMetadata(newNotification.metadata),
              is_read: !!newNotification.is_read,
              deleted_at: newNotification.deleted_at,
            },
            ...prev,
          ]);
          setUnreadCount(prev => prev + 1);

          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .is('deleted_at', null);  // Only update non-deleted notifications

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error.message);
    }
  };

  // Soft delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const removedNotification = notifications.find(n => n.id === notificationId);
      if (removedNotification && !removedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error.message);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
