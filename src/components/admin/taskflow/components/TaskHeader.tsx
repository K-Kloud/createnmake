
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { AddTaskDialog } from "../AddTaskDialog";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface TaskHeaderProps {
  onExport: () => void;
  onTaskAdd: (task: any) => void;
}

export const TaskHeader = ({ onExport, onTaskAdd }: TaskHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <CardTitle>Digital Marketing Workflow Dashboard</CardTitle>
        <CardDescription>Manage your marketing tasks and track progress</CardDescription>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Schedule
        </Button>
        <AddTaskDialog onTaskAdd={onTaskAdd} />
      </div>
    </div>
  );
};
