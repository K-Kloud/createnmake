
import { supabase } from "@/integrations/supabase/client";

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, any>;
}

export const sendNotification = async ({
  userId,
  title,
  message,
  type,
  metadata = {}
}: SendNotificationParams) => {
  try {
    const { error } = await supabase.functions.invoke("send-notification", {
      body: {
        userId,
        title,
        message,
        type,
        metadata
      }
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
};

// Helper functions for specific notification types
export const sendWelcomeNotification = async (userId: string) => {
  return sendNotification({
    userId,
    title: "Welcome to OpenTeknologies!",
    message: "Start exploring and creating amazing designs today.",
    type: "welcome"
  });
};

export const sendVerificationNotification = async (userId: string) => {
  return sendNotification({
    userId,
    title: "Account Verified",
    message: "Your account has been successfully verified.",
    type: "verification"
  });
};

export const sendMilestoneNotification = async (userId: string, milestone: string) => {
  return sendNotification({
    userId,
    title: "Achievement Unlocked!",
    message: `You've reached a new milestone: ${milestone}`,
    type: "milestone",
    metadata: { milestone }
  });
};

export const sendInactivityReminder = async (userId: string, daysInactive: number) => {
  return sendNotification({
    userId,
    title: "We miss you!",
    message: `It's been ${daysInactive} days since your last visit. Come back and see what's new!`,
    type: "re_engagement",
    metadata: { daysInactive }
  });
};

export const sendSecurityAlert = async (userId: string, alertType: string, details: string) => {
  return sendNotification({
    userId,
    title: "Security Alert",
    message: details,
    type: "security",
    metadata: { alertType }
  });
};

export const sendRecommendationNotification = async (userId: string, imageId: number, reason: string) => {
  return sendNotification({
    userId,
    title: "New Design Recommendation",
    message: `We found a new design you might like: ${reason}`,
    type: "recommendation",
    metadata: { imageId, reason }
  });
};

export const sendContentUpdateNotification = async (userId: string, contentType: string, contentId: string) => {
  return sendNotification({
    userId,
    title: "New Content Available",
    message: `New ${contentType} content is now available to explore.`,
    type: "content_update",
    metadata: { contentType, contentId }
  });
};

export const sendDealAnnouncement = async (userId: string, dealTitle: string, discount: string) => {
  return sendNotification({
    userId,
    title: "Special Deal Alert!",
    message: `${dealTitle}: ${discount} off for a limited time!`,
    type: "deal",
    metadata: { dealTitle, discount }
  });
};

export const sendMakeThisReminder = async (userId: string, imageId: number, daysSinceCreation: number) => {
  return sendNotification({
    userId,
    title: "Make This Reminder",
    message: `Don't forget about your design idea from ${daysSinceCreation} days ago. Want to make it real?`,
    type: "make_reminder",
    metadata: { imageId, daysSinceCreation }
  });
};

export const sendCreatorActivityNotification = async (userId: string, creatorId: string, activityType: string) => {
  return sendNotification({
    userId,
    title: "Creator Activity",
    message: `A creator you follow has new activity: ${activityType}`,
    type: "creator_activity",
    metadata: { creatorId, activityType }
  });
};
