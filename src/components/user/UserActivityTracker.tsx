import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Eye, Clock, TrendingUp, Activity } from "lucide-react";

interface UserActivity {
  id: string;
  user_name: string;
  user_email: string;
  action: string;
  page: string;
  timestamp: string;
  duration: number;
  ip_address: string;
}

interface UserMetrics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  average_session_duration: number;
}

interface PageView {
  page: string;
  views: number;
  unique_visitors: number;
}

const ACTIVITY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const UserActivityTracker = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics>({
    total_users: 1247,
    active_users: 89,
    new_users_today: 12,
    average_session_duration: 384
  });
  const [pageViews, setPageViews] = useState<PageView[]>([
    { page: "/dashboard", views: 1250, unique_visitors: 890 },
    { page: "/products", views: 890, unique_visitors: 650 },
    { page: "/orders", views: 760, unique_visitors: 580 },
    { page: "/earnings", views: 540, unique_visitors: 420 },
    { page: "/contact", views: 320, unique_visitors: 280 }
  ]);

  // Generate mock activity data
  useEffect(() => {
    const generateActivities = () => {
      const actions = ["login", "view_page", "create_product", "place_order", "logout"];
      const pages = ["/dashboard", "/products", "/orders", "/earnings", "/contact"];
      const users = [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
        { name: "Bob Johnson", email: "bob@example.com" },
        { name: "Alice Brown", email: "alice@example.com" }
      ];

      const mockActivities: UserActivity[] = [];
      
      for (let i = 0; i < 50; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const activity: UserActivity = {
          id: `activity-${i}`,
          user_name: user.name,
          user_email: user.email,
          action: actions[Math.floor(Math.random() * actions.length)],
          page: pages[Math.floor(Math.random() * pages.length)],
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          duration: Math.floor(Math.random() * 600) + 30,
          ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        };
        mockActivities.push(activity);
      }

      mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(mockActivities);
    };

    generateActivities();
    const interval = setInterval(generateActivities, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "login":
        return "bg-green-100 text-green-800";
      case "logout":
        return "bg-red-100 text-red-800";
      case "create_product":
        return "bg-blue-100 text-blue-800";
      case "place_order":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.active_users}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.new_users_today}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.average_session_duration)}</div>
            <p className="text-xs text-muted-foreground">
              Average duration
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Pages</CardTitle>
            <CardDescription>Most visited pages today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pageViews}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="views"
                    label={({ page, percent }) => `${page.slice(1)} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pageViews.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} views`, "Page Views"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live user activity feed</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {activities.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${activity.user_email}`} />
                      <AvatarFallback>{activity.user_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{activity.user_name}</p>
                        <Badge variant="secondary" className={getActionBadgeColor(activity.action)}>
                          {activity.action.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity.page} • {formatDuration(activity.duration)} • {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Page Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Page Analytics</CardTitle>
          <CardDescription>Detailed page view statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pageViews.map((page) => (
              <div key={page.page} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{page.page}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.unique_visitors} unique visitors
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{page.views}</p>
                  <p className="text-sm text-muted-foreground">views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};