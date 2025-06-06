
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export const CRMActionButtons = () => {
  return (
    <div className="flex gap-4">
      <Button variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
};
