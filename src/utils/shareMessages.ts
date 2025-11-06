export const generateAchievementShareText = (
  userRole: string,
  completedCount: number,
  totalCount: number,
  completionTime?: number
): string => {
  const roleLabels: Record<string, string> = {
    creator: 'Creator',
    artisan: 'Artisan',
    manufacturer: 'Manufacturer',
    buyer: 'Customer',
  };

  const percentage = Math.round((completedCount / totalCount) * 100);
  const roleLabel = roleLabels[userRole] || 'User';

  let message = `🎉 I just completed ${percentage}% of my ${roleLabel} onboarding journey! `;
  
  if (percentage === 100) {
    message += `✅ All ${totalCount} tasks completed! `;
  } else {
    message += `${completedCount}/${totalCount} tasks done! `;
  }

  if (completionTime) {
    const hours = Math.floor(completionTime / 3600);
    const minutes = Math.floor((completionTime % 3600) / 60);
    
    if (hours > 0) {
      message += `⏱️ Finished in ${hours}h ${minutes}m! `;
    } else if (minutes > 0) {
      message += `⏱️ Finished in ${minutes}m! `;
    }
  }

  return message;
};

export const generateLeaderboardShareText = (
  rank: number,
  userRole: string,
  completionTime: number,
  achievementCount: number
): string => {
  const roleLabels: Record<string, string> = {
    creator: 'Creator',
    artisan: 'Artisan',
    manufacturer: 'Manufacturer',
    buyer: 'Customer',
  };

  const roleLabel = roleLabels[userRole] || 'User';
  const minutes = Math.floor(completionTime / 60);
  const seconds = completionTime % 60;

  let medal = '';
  if (rank === 1) medal = '🥇';
  else if (rank === 2) medal = '🥈';
  else if (rank === 3) medal = '🥉';

  return `${medal} Ranked #${rank} on the ${roleLabel} Onboarding Leaderboard! ⚡ Completed in ${minutes}m ${seconds}s with ${achievementCount} achievements unlocked! 🏆`;
};

export const generateBadgeShareText = (
  badgeTitle: string,
  badgeDescription: string,
  userRole: string
): string => {
  return `🎖️ Achievement Unlocked: "${badgeTitle}"! ${badgeDescription} #${userRole}Journey`;
};
