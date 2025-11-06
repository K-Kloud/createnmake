import { supabase } from '@/integrations/supabase/client';

interface AchievementNotification {
  userId: string;
  achievementType: 'milestone' | 'badge' | 'leaderboard';
  achievementTitle: string;
  achievementDescription: string;
  achievementData?: {
    role?: string;
    completedCount?: number;
    totalCount?: number;
    progressPercentage?: number;
    rank?: number;
    completionTime?: number;
    badgeRarity?: string;
  };
}

export const sendAchievementNotification = async (notification: AchievementNotification) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-achievement-email', {
      body: notification,
    });

    if (error) {
      console.error('Error sending achievement notification:', error);
      throw error;
    }

    console.log('Achievement notification sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send achievement notification:', error);
    throw error;
  }
};

export const notifyMilestoneAchievement = async (
  userId: string,
  role: string,
  completedCount: number,
  totalCount: number,
  completionTime?: number
) => {
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  
  let title = '';
  let description = '';

  if (progressPercentage === 100) {
    title = '🎉 Onboarding Complete!';
    description = `Congratulations! You've completed all ${totalCount} tasks in your ${role} onboarding journey!`;
  } else if (progressPercentage >= 75) {
    title = '⚡ Almost There!';
    description = `You're ${progressPercentage}% done with your ${role} onboarding. Just a few more tasks to go!`;
  } else if (progressPercentage >= 50) {
    title = '🌟 Halfway Milestone!';
    description = `Great progress! You've completed ${completedCount} out of ${totalCount} tasks in your ${role} journey.`;
  } else if (progressPercentage >= 25) {
    title = '🎯 Quarter Complete!';
    description = `You're making great progress on your ${role} onboarding with ${completedCount} tasks completed!`;
  } else {
    return; // Don't send emails for very early progress
  }

  await sendAchievementNotification({
    userId,
    achievementType: 'milestone',
    achievementTitle: title,
    achievementDescription: description,
    achievementData: {
      role,
      completedCount,
      totalCount,
      progressPercentage,
      completionTime,
    },
  });
};

export const notifyBadgeUnlocked = async (
  userId: string,
  badgeTitle: string,
  badgeDescription: string,
  badgeRarity: 'common' | 'rare' | 'epic' | 'legendary',
  role: string
) => {
  await sendAchievementNotification({
    userId,
    achievementType: 'badge',
    achievementTitle: `🎖️ Badge Unlocked: ${badgeTitle}`,
    achievementDescription: badgeDescription,
    achievementData: {
      badgeRarity,
      role,
    },
  });
};

export const notifyLeaderboardAchievement = async (
  userId: string,
  rank: number,
  role: string,
  completionTime: number,
  achievementCount: number
) => {
  let title = '';
  let description = '';

  if (rank === 1) {
    title = '🥇 #1 on the Leaderboard!';
    description = `Incredible! You're ranked #1 in the ${role} category!`;
  } else if (rank === 2) {
    title = '🥈 #2 on the Leaderboard!';
    description = `Amazing work! You're ranked #2 in the ${role} category!`;
  } else if (rank === 3) {
    title = '🥉 #3 on the Leaderboard!';
    description = `Fantastic! You're ranked #3 in the ${role} category!`;
  } else if (rank <= 10) {
    title = `🏆 Top 10 on the Leaderboard!`;
    description = `You're ranked #${rank} in the ${role} category. Keep climbing!`;
  } else {
    return; // Only notify top 10
  }

  await sendAchievementNotification({
    userId,
    achievementType: 'leaderboard',
    achievementTitle: title,
    achievementDescription: description,
    achievementData: {
      rank,
      role,
      completionTime,
    },
  });
};
