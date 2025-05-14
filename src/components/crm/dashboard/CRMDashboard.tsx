
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskFilters } from "@/components/crm/TaskFilters";
import { TaskList } from "@/components/crm/TaskList";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Download, BarChart, CheckCircle, AlertCircle, ClockIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskStats } from "@/types/crm";
import { useState } from "react";
import { CRMDashboardSkeleton } from "./CRMDashboardSkeleton";
import { TaskMetricsChart } from "./TaskMetricsChart";

export const CRMDashboard = () => {
  const [filterValues, setFilterValues] = useState({});
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['crm-tasks', filterValues],
    queryFn: async () => {
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
        id: task.id,
        description: task.description,
        company: task.company,
        task_type: task.task_type,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        assignees: [{ initials: 'AI', color: 'bg-blue-500' }], // Default assignee for now
      }));
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: async (): Promise<TaskStats> => {
      // We'd normally fetch this from the backend, but for now we'll compute it from the tasks
      if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };
      
      const now = new Date();
      const completed = tasks.filter(t => t.status === 'completed').length;
      const overdue = tasks.filter(t => 
        t.status !== 'completed' && new Date(t.due_date) < now
      ).length;
      const pending = tasks.filter(t => 
        t.status !== 'completed' && new Date(t.due_date) >= now
      ).length;
      
      return {
        total: tasks.length,
        completed,
        pending,
        overdue
      };
    },
    enabled: !!tasks
  });

  const handleFilterChange = (filters) => {
    setFilterValues(prev => ({ ...prev, ...filters }));
  };

  if (isLoading) return <CRMDashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
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
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.completed}</h3>
                </div>
                <div className="p-2 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.pending}</h3>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded-full">
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.overdue}</h3>
                </div>
                <div className="p-2 bg-red-500/10 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Task Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskMetricsChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kanban">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">Kanban view coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
