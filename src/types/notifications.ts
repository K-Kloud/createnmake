
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  deleted_at?: string | null;
}

export enum NotificationType {
  WELCOME = 'welcome',
  SYSTEM = 'system',
  SECURITY = 'security',
  VERIFICATION = 'verification',
  ORDER = 'order',
  PAYMENT = 'payment',
  MILESTONE = 'milestone',
  RE_ENGAGEMENT = 're_engagement',
  RECOMMENDATION = 'recommendation',
  CONTENT_UPDATE = 'content_update',
  DEAL = 'deal',
  MAKE_REMINDER = 'make_reminder',
  CREATOR_ACTIVITY = 'creator_activity'
}
