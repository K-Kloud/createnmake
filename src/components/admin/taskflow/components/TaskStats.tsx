
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, CalendarDays, AlertTriangle } from "lucide-react";

interface TaskStatsProps {
  stats: {
    completed: number;
    remaining: number;
    progress: number;
    highPriority: number;
  };
}

export const TaskStats = ({ stats }: TaskStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-3xl font-bold text-primary mb-1 flex items-center justify-center">
            <CheckCircle className="mr-2 h-6 w-6" />
            {stats.completed}
          </div>
          <p className="text-sm text-muted-foreground">Tasks Completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-3xl font-bold text-primary mb-1 flex items-center justify-center">
            <Clock className="mr-2 h-6 w-6" />
            {stats.remaining}
          </div>
          <p className="text-sm text-muted-foreground">Tasks Remaining</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-3xl font-bold text-primary mb-1 flex items-center justify-center">
            <CalendarDays className="mr-2 h-6 w-6" />
            {stats.progress}%
          </div>
          <p className="text-sm text-muted-foreground">Weekly Progress</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-3xl font-bold text-primary mb-1 flex items-center justify-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            {stats.highPriority}
          </div>
          <p className="text-sm text-muted-foreground">High Priority Tasks</p>
        </CardContent>
      </Card>
    </div>
  );
};
