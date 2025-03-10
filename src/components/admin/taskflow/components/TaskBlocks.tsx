
import { TaskBlock } from "./TaskBlock";
import { Task } from "../TaskWorkflow";

interface TaskBlocksProps {
  timeBlocks: string[];
  filteredTasks: Task[];
  toggleTaskCompletion: (taskId: string) => void;
}

export const TaskBlocks = ({ timeBlocks, filteredTasks, toggleTaskCompletion }: TaskBlocksProps) => {
  if (timeBlocks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No tasks found for this day</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeBlocks.map(timeBlock => (
        <TaskBlock
          key={timeBlock}
          timeBlock={timeBlock}
          tasks={filteredTasks.filter(task => task.timeBlock === timeBlock)}
          toggleTaskCompletion={toggleTaskCompletion}
        />
      ))}
    </div>
  );
};
