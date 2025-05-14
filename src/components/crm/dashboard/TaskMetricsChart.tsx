
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Sample data - in a real app this would come from your API
const statusData = [
  { name: 'Not Started', value: 8, color: '#94a3b8' },
  { name: 'In Progress', value: 15, color: '#3b82f6' },
  { name: 'Completed', value: 12, color: '#22c55e' },
  { name: 'Waiting', value: 5, color: '#eab308' },
];

const priorityData = [
  { name: 'Low', value: 7, color: '#22c55e' },
  { name: 'Medium', value: 14, color: '#eab308' },
  { name: 'High', value: 10, color: '#f97316' },
  { name: 'Urgent', value: 9, color: '#ef4444' },
];

const typeData = [
  { name: 'Call', value: 8, color: '#8b5cf6' },
  { name: 'Meeting', value: 13, color: '#06b6d4' },
  { name: 'Email', value: 9, color: '#3b82f6' },
  { name: 'Follow Up', value: 7, color: '#14b8a6' },
  { name: 'Website', value: 3, color: '#f97316' },
];

const weeklyData = [
  { name: 'Sun', completed: 2, created: 3 },
  { name: 'Mon', completed: 5, created: 7 },
  { name: 'Tue', completed: 4, created: 5 },
  { name: 'Wed', completed: 6, created: 4 },
  { name: 'Thu', completed: 8, created: 6 },
  { name: 'Fri', completed: 9, created: 7 },
  { name: 'Sat', completed: 3, created: 2 },
];

export const TaskMetricsChart = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="weekly">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
          <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Task Activity</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                <CardTitle className="text-base">By Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
    </div>
  );
};
