import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Clock,
  Award,
  TrendingUp,
  Crown,
  Medal,
} from 'lucide-react';
import { useOnboardingLeaderboard, useTopAchievers } from '@/hooks/useOnboardingLeaderboard';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  creator: 'Creator',
  artisan: 'Artisan',
  manufacturer: 'Manufacturer',
  buyer: 'Customer',
  all: 'All Roles',
};

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

interface LeaderboardTableProps {
  role: string;
  type: 'speed' | 'achievements';
}

const LeaderboardTable = ({ role, type }: LeaderboardTableProps) => {
  const { data: speedData, isLoading: speedLoading } = useOnboardingLeaderboard(role);
  const { data: achievementData, isLoading: achievementLoading } = useTopAchievers(role);

  const data = type === 'speed' ? speedData : achievementData;
  const isLoading = type === 'speed' ? speedLoading : achievementLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No completions yet. Be the first!</p>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-amber-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    if (index === 1) return 'bg-slate-400/10 text-slate-400 border-slate-400/30';
    if (index === 2) return 'bg-amber-700/10 text-amber-700 border-amber-700/30';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-3">
      {data.map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            'flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
            index < 3 ? 'bg-gradient-to-r from-primary/5 to-background' : 'bg-muted/30'
          )}
        >
          {/* Rank */}
          <div className="flex items-center justify-center w-12">
            {getRankIcon(index) || (
              <Badge variant="outline" className={getRankBadgeColor(index)}>
                #{index + 1}
              </Badge>
            )}
          </div>

          {/* User Info */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={entry.avatar_url} alt={entry.username} />
            <AvatarFallback>
              {entry.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {entry.username}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {roleLabels[entry.user_role]}
              </Badge>
              <span className="truncate">
                {entry.tasks_completed}/{entry.total_tasks} tasks
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {formatTime(entry.completion_time_seconds)}
              </div>
              <p className="text-xs text-muted-foreground">Completion time</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                <Award className="h-4 w-4 text-amber-500" />
                {entry.achievement_count}
              </div>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const OnboardingLeaderboard = () => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Onboarding Leaderboard
              </h3>
              <p className="text-sm text-muted-foreground">
                Top performers across all roles
              </p>
            </div>
          </div>
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="speed-all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="speed-all" className="gap-2">
              <Clock className="h-4 w-4" />
              Fastest Times
            </TabsTrigger>
            <TabsTrigger value="achievements-all" className="gap-2">
              <Award className="h-4 w-4" />
              Most Achievements
            </TabsTrigger>
          </TabsList>

          {/* Speed Leaderboard */}
          <TabsContent value="speed-all" className="space-y-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="creator">Creator</TabsTrigger>
                <TabsTrigger value="artisan">Artisan</TabsTrigger>
                <TabsTrigger value="manufacturer">Manufacturer</TabsTrigger>
                <TabsTrigger value="buyer">Customer</TabsTrigger>
              </TabsList>

              {['all', 'creator', 'artisan', 'manufacturer', 'buyer'].map((role) => (
                <TabsContent key={`speed-${role}`} value={role} className="mt-6">
                  <LeaderboardTable role={role} type="speed" />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Achievements Leaderboard */}
          <TabsContent value="achievements-all" className="space-y-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="creator">Creator</TabsTrigger>
                <TabsTrigger value="artisan">Artisan</TabsTrigger>
                <TabsTrigger value="manufacturer">Manufacturer</TabsTrigger>
                <TabsTrigger value="buyer">Customer</TabsTrigger>
              </TabsList>

              {['all', 'creator', 'artisan', 'manufacturer', 'buyer'].map((role) => (
                <TabsContent key={`achieve-${role}`} value={role} className="mt-6">
                  <LeaderboardTable role={role} type="achievements" />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
