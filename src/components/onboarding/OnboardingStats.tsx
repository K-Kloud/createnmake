import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  CheckCircle2,
  Target,
  Calendar,
  TrendingUp,
  Award,
} from 'lucide-react';
import { OnboardingTask } from '@/hooks/useOnboardingProgress';
import { useEffect, useState } from 'react';

interface OnboardingStatsProps {
  tasks: OnboardingTask[];
  userRole: string;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

export const OnboardingStats = ({
  tasks,
  userRole,
  completedCount,
  totalCount,
  progressPercentage,
}: OnboardingStatsProps) => {
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('');

  useEffect(() => {
    // Load time tracking data from localStorage
    const userId = localStorage.getItem('user_id');
    if (userId) {
      const trackingKey = `onboarding_tracking_${userId}`;
      const tracking = localStorage.getItem(trackingKey);
      
      if (tracking) {
        const data = JSON.parse(tracking);
        setTimeSpent(data.timeSpent || 0);
        setStartDate(data.startDate || new Date().toISOString());
        
        // Calculate estimated completion
        if (completedCount > 0 && completedCount < totalCount) {
          const avgTimePerTask = data.timeSpent / completedCount;
          const remainingTasks = totalCount - completedCount;
          const estimatedMinutes = Math.ceil((avgTimePerTask * remainingTasks) / 60000);
          setEstimatedCompletion(`~${estimatedMinutes} min remaining`);
        } else if (completedCount === totalCount) {
          setEstimatedCompletion('Completed!');
        } else {
          setEstimatedCompletion('Starting...');
        }
      } else {
        // Initialize tracking
        const newTracking = {
          startDate: new Date().toISOString(),
          timeSpent: 0,
          lastActive: new Date().toISOString(),
        };
        localStorage.setItem(trackingKey, JSON.stringify(newTracking));
        setStartDate(newTracking.startDate);
      }
    }

    // Update time spent every minute
    const interval = setInterval(() => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const trackingKey = `onboarding_tracking_${userId}`;
        const tracking = localStorage.getItem(trackingKey);
        
        if (tracking) {
          const data = JSON.parse(tracking);
          const now = new Date();
          const lastActive = new Date(data.lastActive);
          const diff = now.getTime() - lastActive.getTime();
          
          // Only count time if active in last 5 minutes
          if (diff < 300000) {
            data.timeSpent = (data.timeSpent || 0) + 60000;
            data.lastActive = now.toISOString();
            localStorage.setItem(trackingKey, JSON.stringify(data));
            setTimeSpent(data.timeSpent);
          }
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [completedCount, totalCount]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getDaysSinceStart = () => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const stats = [
    {
      icon: CheckCircle2,
      label: 'Tasks Completed',
      value: `${completedCount}/${totalCount}`,
      description: `${Math.round(progressPercentage)}% complete`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Clock,
      label: 'Time Spent',
      value: formatTime(timeSpent),
      description: estimatedCompletion,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Calendar,
      label: 'Days Active',
      value: getDaysSinceStart(),
      description: `Since ${new Date(startDate).toLocaleDateString()}`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Target,
      label: 'Remaining Tasks',
      value: totalCount - completedCount,
      description: completedCount === totalCount ? 'All done!' : 'Keep going!',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Overall Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Overall Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your onboarding journey completion
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {Math.round(progressPercentage)}%
              </p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-3" />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completedCount} completed</span>
            <span>{totalCount - completedCount} remaining</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
