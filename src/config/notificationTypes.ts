
export const NOTIFICATION_TYPES = {
  WELCOME: "welcome",
  VERIFICATION: "verification",
  MILESTONE: "milestone",
  INACTIVITY: "re_engagement",
  SECURITY: "security",
  RECOMMENDATION: "recommendation",
  CONTENT_UPDATE: "content_update",
  DEAL: "deal",
  COMMENT_REPLY: "comment_reply",
  MAKE_REMINDER: "make_reminder", 
  CREATOR_ACTIVITY: "creator_activity"
};

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case NOTIFICATION_TYPES.WELCOME:
      return "🎉";
    case NOTIFICATION_TYPES.VERIFICATION:
      return "✅";
    case NOTIFICATION_TYPES.MILESTONE:
      return "🏆";
    case NOTIFICATION_TYPES.INACTIVITY:
      return "👋";
    case NOTIFICATION_TYPES.SECURITY:
      return "🔒";
    case NOTIFICATION_TYPES.RECOMMENDATION:
      return "💡";
    case NOTIFICATION_TYPES.CONTENT_UPDATE:
      return "📢";
    case NOTIFICATION_TYPES.DEAL:
      return "💰";
    case NOTIFICATION_TYPES.COMMENT_REPLY:
      return "💬";
    case NOTIFICATION_TYPES.MAKE_REMINDER:
      return "⏰";
    case NOTIFICATION_TYPES.CREATOR_ACTIVITY:
      return "👤";
    default:
      return "📣";
  }
};
