
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CRMTask, TaskStats } from "@/types/crm";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Icons } from "@/components/Icons";

const CRMAnalytics = () => {
  // Use auth guard to protect the page
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard('/');

  // Fetch CRM tasks data
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['analytics-tasks'],
    queryFn: async (): Promise<CRMTask[]> => {
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
          owner_id,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(task => ({
        id: String(task.id),
        description: task.description,
        company: task.company,
        task_type: task.task_type as CRMTask['task_type'],
        status: task.status as CRMTask['status'],
        priority: task.priority as CRMTask['priority'],
        due_date: task.due_date,
        created_at: task.created_at,
        assignees: [{ initials: 'AI', color: 'bg-blue-500' }],
      }));
    },
    enabled: isAuthenticated
  });

  // Calculate task statistics
  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: (): TaskStats => {
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

  // Group tasks by status for pie chart
  const statusData = tasks ? [
    { name: 'Not Started', value: tasks.filter(t => t.status === 'not_started').length, color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#22c55e' },
    { name: 'Waiting', value: tasks.filter(t => t.status === 'waiting').length, color: '#eab308' }
  ].filter(item => item.value > 0) : [];

  // Group tasks by type for pie chart
  const typeData = tasks ? [
    { name: 'Call', value: tasks.filter(t => t.task_type === 'call').length, color: '#8b5cf6' },
    { name: 'Meeting', value: tasks.filter(t => t.task_type === 'meeting').length, color: '#06b6d4' },
    { name: 'Email', value: tasks.filter(t => t.task_type === 'email').length, color: '#3b82f6' },
    { name: 'Follow Up', value: tasks.filter(t => t.task_type === 'follow_up').length, color: '#14b8a6' },
    { name: 'Website', value: tasks.filter(t => t.task_type === 'website_task').length, color: '#f97316' },
    { name: 'Content', value: tasks.filter(t => t.task_type === 'content_update').length, color: '#ec4899' }
  ].filter(item => item.value > 0) : [];
  
  // Calculate weekly task activity data
  const getWeeklyActivityData = () => {
    if (!tasks) return [];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at || task.due_date);
        return taskDate.getDate() === date.getDate() &&
               taskDate.getMonth() === date.getMonth() &&
               taskDate.getFullYear() === date.getFullYear();
      });
      
      const completedTasks = dayTasks.filter(task => task.status === 'completed');
      
      return {
        name: day,
        created: dayTasks.length,
        completed: completedTasks.length
      };
    });
  };
  
  const weeklyData = getWeeklyActivityData();
  
  // Show loading state
  if (authLoading || tasksLoading) {
    return (
      <>
        <Helmet>
          <title>Analytics | CRM</title>
        </Helmet>
        <CRMLayout currentTab="analytics">
          <div className="flex justify-center items-center h-64">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading analytics data...</span>
          </div>
        </CRMLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics | CRM</title>
      </Helmet>
      <CRMLayout currentTab="analytics">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          
          {tasks && tasks.length > 0 ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.total || 0}</h3>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Icons.layoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.completed || 0}</h3>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded-full">
                        <Icons.check className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.pending || 0}</h3>
                      </div>
                      <div className="p-2 bg-yellow-500/10 rounded-full">
                        <Icons.clock className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                        <h3 className="text-2xl font-bold mt-1">{stats?.overdue || 0}</h3>
                      </div>
                      <div className="p-2 bg-red-500/10 rounded-full">
                        <Icons.alertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="weekly">
                    <TabsList className="mb-6">
                      <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
                      <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="weekly">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="created" name="Tasks Created" fill="#3b82f6" />
                            <Bar dataKey="completed" name="Tasks Completed" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="distribution">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">By Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                  >
                                    {statusData.map((entry, index) => (
                                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">By Type</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                  >
                                    {typeData.map((entry, index) => (
                                      <Cell key={`type-cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Data Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-muted-foreground">
                  No task data available for analytics. Create some tasks in the CRM to see analytics here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CRMLayout>
    </>
  );
};

export default CRMAnalytics;
