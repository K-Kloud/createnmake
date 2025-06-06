
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, CheckCircle, AlertCircle, ClockIcon } from "lucide-react";
import { TaskStats } from "@/types/crm";

interface CRMStatCardsProps {
  stats: TaskStats | undefined;
}

export const CRMStatCards = ({ stats }: CRMStatCardsProps) => {
  if (!stats) return null;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold mt-1">{stats.completed}</h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold mt-1">{stats.pending}</h3>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <h3 className="text-2xl font-bold mt-1">{stats.overdue}</h3>
            </div>
            <div className="p-2 bg-red-500/10 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
