
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "../TaskWorkflow";

interface TaskBlockProps {
  timeBlock: string;
  tasks: Task[];
  toggleTaskCompletion: (taskId: string) => void;
}

export const TaskBlock = ({ timeBlock, tasks, toggleTaskCompletion }: TaskBlockProps) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <div className="bg-secondary p-3 rounded-t-lg">
        <h3 className="font-medium text-secondary-foreground">{timeBlock}</h3>
      </div>
      <div className="divide-y">
        {tasks.map(task => (
          <div 
            key={task.id}
            className={`p-4 flex gap-4 items-start ${
              task.completed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center h-5 mt-1">
              <Checkbox 
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTaskCompletion(task.id)}
              />
            </div>
            <div className="min-w-[120px] text-sm font-medium">
              {task.time}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${
                task.important ? "text-accent" : ""
              } ${task.completed ? "line-through" : ""}`}>
                {task.title}
              </h4>
              <p className={`text-sm text-muted-foreground mt-1 ${
                task.completed ? "line-through" : ""
              }`}>
                {task.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
