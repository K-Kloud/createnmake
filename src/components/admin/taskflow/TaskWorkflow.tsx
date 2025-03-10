
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { TaskFilters } from "@/components/crm/TaskFilters";
import { exportTaskReport } from "./TaskExporter";
import { TaskStats } from "./components/TaskStats";
import { DaySelector } from "./components/DaySelector";
import { TaskBlocks } from "./components/TaskBlocks";
import { TaskHeader } from "./components/TaskHeader";
import { useTaskManagement } from "./hooks/useTaskManagement";

// Export the Task interface so it can be used in other files
export interface Task {
  id: string;
  title: string;
  description: string;
  time: string;
  timeBlock: string;
  day: string;
  completed: boolean;
  important: boolean;
}

export const TaskWorkflow = () => {
  const {
    activeDay,
    setActiveDay,
    stats,
    handleFilterChange,
    toggleTaskCompletion,
    handleAddTask,
    getFilteredTasks,
    getTimeBlocks
  } = useTaskManagement();

  const handleExportSchedule = () => {
    exportTaskReport(getFilteredTasks());
  };

  const filteredTasks = getFilteredTasks();
  const timeBlocks = getTimeBlocks(filteredTasks);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <TaskHeader 
          onExport={handleExportSchedule} 
          onTaskAdd={handleAddTask} 
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <TaskStats stats={stats} />

        <div className="pb-4">
          <TaskFilters onFilterChange={handleFilterChange} />
        </div>

        <DaySelector 
          activeDay={activeDay} 
          setActiveDay={setActiveDay} 
        />

        <TaskBlocks 
          timeBlocks={timeBlocks} 
          filteredTasks={filteredTasks} 
          toggleTaskCompletion={toggleTaskCompletion} 
        />
      </CardContent>
    </Card>
  );
};
