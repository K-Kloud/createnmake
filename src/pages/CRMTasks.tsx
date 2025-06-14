
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskFilters } from "@/components/crm/TaskFilters";
import { TaskList } from "@/components/crm/TaskList";
import { GoogleSheetsSync } from "@/components/crm/GoogleSheetsSync";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CRMTask } from "@/types/crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CRMTasks = () => {
  const [filterValues, setFilterValues] = useState({});
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['crm-tasks', filterValues],
    queryFn: async (): Promise<CRMTask[]> => {
      let query = supabase
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
      
      // Apply filters if they exist
      if (filterValues) {
        if (filterValues['search']) {
          query = query.ilike('description', `%${filterValues['search']}%`);
        }
        if (filterValues['taskType'] && filterValues['taskType'] !== 'all') {
          query = query.eq('task_type', filterValues['taskType']);
        }
        if (filterValues['status'] && filterValues['status'] !== 'all') {
          query = query.eq('status', filterValues['status']);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(task => ({
        id: String(task.id),
        description: task.description,
        company: task.company,
        task_type: task.task_type as CRMTask['task_type'],
        status: task.status as CRMTask['status'],
        priority: task.priority as CRMTask['priority'],
        due_date: task.due_date,
        assignees: [{ initials: 'AI', color: 'bg-blue-500' }],
      }));
    }
  });

  const handleFilterChange = (filters) => {
    setFilterValues(prev => ({ ...prev, ...filters }));
  };

  return (
    <>
      <Helmet>
        <title>Tasks | CRM</title>
      </Helmet>
      <CRMLayout currentTab="tasks">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          
          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="google-sheets">Google Sheets Sync</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-6">
              <TaskFilters onFilterChange={handleFilterChange} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Loading tasks...</p>
                    </div>
                  ) : tasks && tasks.length > 0 ? (
                    <TaskList tasks={tasks} />
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No tasks found matching your filters.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="google-sheets">
              <GoogleSheetsSync />
            </TabsContent>
          </Tabs>
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMTasks;
