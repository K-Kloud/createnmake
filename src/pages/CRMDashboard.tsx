import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { TaskList } from "@/components/crm/TaskList";
import { TaskFilters } from "@/components/crm/TaskFilters";

// Mock data with correct status types
const mockTasks = [
  {
    id: 1,
    description: "Prepare new quotation",
    company: "Brainlongue",
    taskType: "Call",
    status: "in_progress" as const,
    priority: "urgent" as const,
    dueDate: "2024-02-21",
    assignees: [
      { initials: "AC", color: "bg-blue-500" },
      { initials: "JD", color: "bg-green-500" },
    ],
  },
  {
    id: 2,
    description: "6 weekly service call",
    company: "Hugeable",
    taskType: "Call",
    status: "completed" as const,
    priority: "medium" as const,
    dueDate: "2024-02-21",
    assignees: [
      { initials: "MK", color: "bg-purple-500" },
    ],
  },
];

const CRMDashboard = () => {
  const [tasks] = useState(mockTasks);

  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
    // Implement filter logic here
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <TaskFilters onFilterChange={handleFilterChange} />
          
          <div className="rounded-lg border bg-card">
            <TaskList tasks={tasks} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CRMDashboard;