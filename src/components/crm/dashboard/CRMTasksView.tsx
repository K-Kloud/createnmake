
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskFilters } from "@/components/crm/TaskFilters";
import { TaskList } from "@/components/crm/TaskList";
import { CRMTask } from "@/types/crm";
import { useState } from "react";

interface CRMTasksViewProps {
  tasks: CRMTask[] | undefined;
}

export const CRMTasksView = ({ tasks }: CRMTasksViewProps) => {
  const [filterValues, setFilterValues] = useState({});

  const handleFilterChange = (filters) => {
    setFilterValues(prev => ({ ...prev, ...filters }));
  };

  return (
    <div className="space-y-6">
      <TaskFilters onFilterChange={handleFilterChange} />
      
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <TaskList tasks={tasks} />
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No tasks found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
