import { useState } from 'react';
import { X, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const taskRoutes: Record<string, string> = {
  setup_profile: '/settings',
  create_design: '/create',
  browse_marketplace: '/marketplace',
  make_purchase: '/marketplace',
  list_design: '/marketplace',
  explore_tools: '/create',
  try_ai_generator: '/create',
  browse_orders: '/artisan',
  accept_quote: '/artisan',
  update_status: '/artisan',
  set_capacity: '/settings',
};

export const OnboardingChecklist = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    tasks,
    isVisible,
    loading,
    completedCount,
    totalCount,
    progressPercentage,
    userRole,
    dismissChecklist,
  } = useOnboardingProgress();

  const roleLabels: Record<string, string> = {
    creator: 'Creator',
    artisan: 'Artisan',
    manufacturer: 'Manufacturer',
    buyer: 'Customer',
  };

  if (loading || !isVisible || tasks.length === 0) return null;

  const allCompleted = completedCount === totalCount;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <Card className="border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {allCompleted ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-300" />
                    Onboarding Complete! 🎉
                  </>
                ) : (
                  <>
                    {roleLabels[userRole]} Getting Started
                    <span className="text-sm font-normal text-muted-foreground">
                      ({completedCount}/{totalCount})
                    </span>
                  </>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {allCompleted
                  ? "You're all set! Explore more features."
                  : 'Complete these tasks to unlock the full potential'}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-background/50"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-background/50"
                onClick={dismissChecklist}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </div>

        {/* Task List */}
        {isExpanded && (
          <div className="p-4 space-y-2">
            {tasks.map((task, index) => {
              const IconComponent = Icons[task.icon as keyof typeof Icons] as any;
              
              return (
                <button
                  key={task.id}
                  onClick={() => !task.completed && navigate(taskRoutes[task.id])}
                  disabled={task.completed}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all duration-300",
                    "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                    "animate-in slide-in-from-left-3 fade-in",
                    task.completed
                      ? "bg-green-500/10 border-green-500/30 cursor-default"
                      : "bg-background border-border hover:border-primary/30 cursor-pointer"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-300" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        task.completed
                          ? "bg-green-500/20 text-green-500"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={cn(
                          "font-medium text-sm transition-colors",
                          task.completed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {isExpanded && allCompleted && (
          <div className="p-4 pt-0 animate-in fade-in duration-500">
            <Button
              onClick={dismissChecklist}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Dismiss Checklist
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
