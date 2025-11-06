import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OnboardingStats } from '@/components/onboarding/OnboardingStats';
import { AchievementBadges } from '@/components/onboarding/AchievementBadges';
import { ProgressTimeline } from '@/components/onboarding/ProgressTimeline';
import { OnboardingLeaderboard } from '@/components/onboarding/OnboardingLeaderboard';
import { SocialShare } from '@/components/onboarding/SocialShare';
import { generateAchievementShareText } from '@/utils/shareMessages';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, TrendingUp } from 'lucide-react';

export default function OnboardingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    tasks,
    userRole,
    completedCount,
    totalCount,
    progressPercentage,
    loading,
  } = useOnboardingProgress();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    creator: 'Creator',
    artisan: 'Artisan',
    manufacturer: 'Manufacturer',
    buyer: 'Customer',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-foreground">
              Your Onboarding Journey
            </h1>
            <p className="text-muted-foreground text-lg">
              {roleLabels[userRole]} Progress Dashboard
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Done</p>
                  <p className="text-2xl font-bold text-foreground">
                    {completedCount}/{totalCount}
                  </p>
                </div>
              </div>
            </Card>
            <SocialShare
              title="My Onboarding Achievement"
              text={generateAchievementShareText(userRole, completedCount, totalCount)}
              hashtags={['OnboardingSuccess', userRole]}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <OnboardingStats
          tasks={tasks}
          userRole={userRole}
          completedCount={completedCount}
          totalCount={totalCount}
          progressPercentage={progressPercentage}
        />

        {/* Achievement Badges */}
        <AchievementBadges
          tasks={tasks}
          userRole={userRole}
          progressPercentage={progressPercentage}
        />

        {/* Progress Timeline */}
        <ProgressTimeline tasks={tasks} userRole={userRole} />

        {/* Leaderboard */}
        <OnboardingLeaderboard />

        {/* Next Steps */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Next Steps
          </h3>
          <div className="space-y-3">
            {tasks
              .filter((task) => !task.completed)
              .slice(0, 3)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border"
                >
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
