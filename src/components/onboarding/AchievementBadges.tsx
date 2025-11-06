import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Trophy,
  Star,
  Zap,
  Crown,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { OnboardingTask } from '@/hooks/useOnboardingProgress';
import { cn } from '@/lib/utils';
import { SocialShare } from './SocialShare';
import { generateBadgeShareText } from '@/utils/shareMessages';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notifyBadgeUnlocked } from '@/utils/achievementNotifications';

interface AchievementBadgesProps {
  tasks: OnboardingTask[];
  userRole: string;
  progressPercentage: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const AchievementBadges = ({
  tasks,
  userRole,
  progressPercentage,
}: AchievementBadgesProps) => {
  const { user } = useAuth();
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const notifiedBadges = useRef<Set<string>>(new Set());

  const roleLabels: Record<string, string> = {
    creator: 'Creator',
    artisan: 'Artisan',
    manufacturer: 'Manufacturer',
    buyer: 'Customer',
  };

  // Define achievements based on progress
  const achievements: Achievement[] = [
    {
      id: 'first_step',
      title: 'First Steps',
      description: 'Complete your first onboarding task',
      icon: Sparkles,
      unlocked: completedCount >= 1,
      rarity: 'common',
    },
    {
      id: 'halfway',
      title: 'Halfway There',
      description: 'Complete 50% of your onboarding',
      icon: Target,
      unlocked: progressPercentage >= 50,
      rarity: 'rare',
    },
    {
      id: 'almost_done',
      title: 'Almost There',
      description: 'Complete 75% of your onboarding',
      icon: Zap,
      unlocked: progressPercentage >= 75,
      rarity: 'epic',
    },
    {
      id: 'onboarding_complete',
      title: `${roleLabels[userRole]} Master`,
      description: 'Complete all onboarding tasks',
      icon: Crown,
      unlocked: completedCount === totalCount,
      rarity: 'legendary',
    },
    {
      id: 'quick_learner',
      title: 'Quick Learner',
      description: 'Complete 3 tasks in one session',
      icon: Star,
      unlocked: completedCount >= 3,
      rarity: 'rare',
    },
    {
      id: 'dedicated',
      title: 'Dedicated',
      description: 'Return to complete more tasks',
      icon: Trophy,
      unlocked: completedCount >= 2,
      rarity: 'common',
    },
  ];

  const rarityColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    common: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-500',
      border: 'border-slate-500/30',
      glow: 'shadow-slate-500/20',
    },
    rare: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/20',
    },
    epic: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/20',
    },
    legendary: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/20',
    },
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Send email notifications for newly unlocked badges
  useEffect(() => {
    if (!user) return;

    achievements.forEach((achievement) => {
      if (achievement.unlocked && !notifiedBadges.current.has(achievement.id)) {
        notifiedBadges.current.add(achievement.id);
        
        // Send notification for legendary and epic badges
        if (['legendary', 'epic'].includes(achievement.rarity)) {
          notifyBadgeUnlocked(
            user.id,
            achievement.title,
            achievement.description,
            achievement.rarity as 'legendary' | 'epic',
            userRole
          ).catch(error => {
            console.error('Error sending badge notification:', error);
          });
        }
      }
    });
  }, [achievements, user, userRole]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Achievements
              </h3>
              <p className="text-sm text-muted-foreground">
                {unlockedCount} of {achievements.length} unlocked
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const colors = rarityColors[achievement.rarity];

            return (
              <div
                key={achievement.id}
                className={cn(
                  'relative p-6 rounded-lg border-2 transition-all duration-300',
                  achievement.unlocked
                    ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow} hover:scale-105`
                    : 'bg-muted/50 border-muted opacity-50 grayscale'
                )}
              >
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className={cn('h-5 w-5', colors.text)} />
                  </div>
                )}

                <div className="space-y-3">
                  <div
                    className={cn(
                      'inline-flex p-3 rounded-lg',
                      achievement.unlocked ? colors.bg : 'bg-muted'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-8 w-8',
                        achievement.unlocked ? colors.text : 'text-muted-foreground'
                      )}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={achievement.unlocked ? 'default' : 'secondary'}
                      className={cn(
                        'capitalize',
                        achievement.unlocked && colors.text
                      )}
                    >
                      {achievement.rarity}
                    </Badge>
                    
                    {achievement.unlocked && (
                      <SocialShare
                        title={achievement.title}
                        text={generateBadgeShareText(
                          achievement.title,
                          achievement.description,
                          userRole
                        )}
                        hashtags={['Achievement', userRole, achievement.rarity]}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress to next achievement */}
        {unlockedCount < achievements.length && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Next Achievement</p>
                <p className="text-sm text-muted-foreground">
                  {achievements.find((a) => !a.unlocked)?.title || 'All unlocked!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
