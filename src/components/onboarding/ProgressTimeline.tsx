import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { OnboardingTask } from '@/hooks/useOnboardingProgress';
import { cn } from '@/lib/utils';

interface ProgressTimelineProps {
  tasks: OnboardingTask[];
  userRole: string;
}

export const ProgressTimeline = ({ tasks, userRole }: ProgressTimelineProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Progress Timeline
            </h3>
            <p className="text-sm text-muted-foreground">
              Track your onboarding journey step by step
            </p>
          </div>
        </div>

        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {tasks.map((task, index) => {
            const IconComponent = Icons[task.icon as keyof typeof Icons] as any;
            const isLast = index === tasks.length - 1;

            return (
              <div key={task.id} className="relative flex gap-4">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full border-4 border-background',
                      task.completed
                        ? 'bg-green-500 shadow-lg shadow-green-500/20'
                        : 'bg-muted'
                    )}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Task content */}
                <div className="flex-1 pb-8">
                  <div
                    className={cn(
                      'p-4 rounded-lg border transition-all duration-300',
                      task.completed
                        ? 'bg-green-500/5 border-green-500/30'
                        : 'bg-muted/30 border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={cn(
                            'p-2 rounded-lg mt-0.5',
                            task.completed
                              ? 'bg-green-500/20'
                              : 'bg-primary/10'
                          )}
                        >
                          {IconComponent && (
                            <IconComponent
                              className={cn(
                                'h-5 w-5',
                                task.completed
                                  ? 'text-green-500'
                                  : 'text-primary'
                              )}
                            />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4
                              className={cn(
                                'font-semibold text-foreground',
                                task.completed && 'line-through text-muted-foreground'
                              )}
                            >
                              {task.title}
                            </h4>
                            {task.completed && (
                              <Badge
                                variant="secondary"
                                className="bg-green-500/20 text-green-500 border-green-500/30"
                              >
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          Step {index + 1}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks
              completed
            </p>
            {tasks.every((t) => t.completed) && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                Journey Complete! 🎉
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
