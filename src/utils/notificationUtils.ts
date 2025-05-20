
import { NotificationType } from '@/types/notifications';
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to create a notification for a user
 * @param userId The user ID
 * @param title The notification title
 * @param message The notification message
 * @param type The notification type
 * @param metadata Optional metadata for the notification
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  metadata?: Record<string, any>
) => {
  try {
    const { data, error } = await supabase.from('user_notifications').insert([
      {
        user_id: userId,
        title,
        message,
        notification_type: type,
        metadata,
        is_read: false,
      },
    ]);

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Helper function to check if notifications are enabled for a specific type
 * @param userId The user ID
 * @param type The notification type
 * @returns Boolean indicating if notifications are enabled
 */
export const areNotificationsEnabled = async (
  userId: string,
  type: NotificationType
): Promise<boolean> => {
  try {
    // This would check against user's preferences in the database
    // For now, return true by default
    return true;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return true; // Default to enabled if there's an error
  }
};

/**
 * Format a notification timestamp into a readable format
 * @param timestamp The timestamp to format
 * @returns A readable string representation of the time since the notification
 */
export const formatNotificationTime = (timestamp: string): string => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};
