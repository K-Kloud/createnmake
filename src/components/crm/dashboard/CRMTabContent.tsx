
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CRMTasksView } from "./CRMTasksView";
import { TaskMetricsChart } from "./TaskMetricsChart";
import { GoogleSheetsSync } from "@/components/crm/GoogleSheetsSync";
import { CRMTask } from "@/types/crm";

interface CRMTabContentProps {
  activeTab: string;
  tasks: CRMTask[] | undefined;
}

export const CRMTabContent = ({ activeTab, tasks }: CRMTabContentProps) => {
  switch (activeTab) {
    case "list":
      return <CRMTasksView tasks={tasks} />;
      
    case "analytics":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Task Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskMetricsChart />
          </CardContent>
        </Card>
      );
      
    case "kanban":
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-10">
              <p className="text-muted-foreground">Kanban view coming soon.</p>
            </div>
          </CardContent>
        </Card>
      );
      
    case "google-sheets":
      return <GoogleSheetsSync />;
      
    default:
      return <CRMTasksView tasks={tasks} />;
  }
};
