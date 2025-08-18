import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, Zap, Database, Wifi, AlertTriangle, CheckCircle } from "lucide-react";

interface PerformanceMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  response_time: number;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: "1",
      type: "warning",
      message: "High memory usage detected (85%)",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      resolved: false
    },
    {
      id: "2",
      type: "info",
      message: "Database optimization completed",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      resolved: true
    }
  ]);

  // Generate mock performance data
  useEffect(() => {
    const generateMetrics = () => {
      const now = new Date();
      const data: PerformanceMetric[] = [];
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 3600000);
        data.push({
          timestamp: timestamp.toISOString(),
          cpu: Math.floor(Math.random() * 40) + 30,
          memory: Math.floor(Math.random() * 30) + 50,
          network: Math.floor(Math.random() * 50) + 20,
          response_time: Math.floor(Math.random() * 100) + 50
        });
      }
      
      setMetrics(data);
    };

    generateMetrics();
    const interval = setInterval(generateMetrics, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const currentMetrics = metrics[metrics.length - 1] || {
    cpu: 0,
    memory: 0,
    network: 0,
    response_time: 0
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return "text-red-500";
    if (value >= thresholds.warning) return "text-yellow-500";
    return "text-green-500";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(currentMetrics.cpu, { warning: 70, danger: 85 })}>
                {currentMetrics.cpu}%
              </span>
            </div>
            <Progress value={currentMetrics.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(currentMetrics.memory, { warning: 80, danger: 90 })}>
                {currentMetrics.memory}%
              </span>
            </div>
            <Progress value={currentMetrics.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(currentMetrics.network, { warning: 75, danger: 90 })}>
                {currentMetrics.network}%
              </span>
            </div>
            <Progress value={currentMetrics.network} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(currentMetrics.response_time, { warning: 200, danger: 500 })}>
                {currentMetrics.response_time}ms
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg response time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU & Memory Usage (24h)</CardTitle>
            <CardDescription>Real-time system resource monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => formatTime(value)}
                    formatter={(value: number, name: string) => [`${value}%`, name === 'cpu' ? 'CPU' : 'Memory']}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.3)"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stackId="2"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary) / 0.3)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network & Response Time</CardTitle>
            <CardDescription>Network performance and latency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1000]} />
                  <Tooltip 
                    labelFormatter={(value) => formatTime(value)}
                    formatter={(value: number, name: string) => [
                      name === 'response_time' ? `${value}ms` : `${value}%`,
                      name === 'network' ? 'Network' : 'Response Time'
                    ]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="network"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="response_time"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent system notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  alert.resolved ? 'bg-muted/50' : 'bg-background'
                }`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className={`text-sm ${alert.resolved ? 'text-muted-foreground' : ''}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant={alert.resolved ? "secondary" : alert.type === "error" ? "destructive" : "default"}>
                  {alert.resolved ? "Resolved" : alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};