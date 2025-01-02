import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { TaskList } from "@/components/crm/TaskList";
import { TaskFilters } from "@/components/crm/TaskFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/components/crm/TaskList";

const CRMDashboard = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['crm-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select(`
          id,
          description,
          company,
          task_type,
          status,
          priority,
          due_date,
          assignee_id,
          owner_id
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Ensure the data matches the Task interface
      return data.map(task => ({
        id: task.id,
        description: task.description,
        company: task.company,
        task_type: task.task_type,
        status: task.status as Task['status'], // Type assertion to ensure it matches the enum
        priority: task.priority as Task['priority'], // Type assertion to ensure it matches the enum
        due_date: task.due_date,
        assignees: [{ initials: 'AI', color: 'bg-blue-500' }], // Default assignee for now
      }));
    }
  });

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
            {isLoading ? (
              <div className="p-8 text-center">Loading tasks...</div>
            ) : (
              <TaskList tasks={tasks || []} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CRMDashboard;