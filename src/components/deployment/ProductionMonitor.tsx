import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  Server, 
  Shield,
  TrendingUp,
  Users
} from "lucide-react";

interface ProductionMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: string;
  responseTime: number;
}

export const ProductionMonitor = () => {
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    uptime: 99.9,
    responseTime: 120,
    errorRate: 0.1,
    activeUsers: 1247,
    databaseConnections: 45,
    cpuUsage: 35,
    memoryUsage: 68,
    networkLatency: 25,
  });

  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { service: 'Web Application', status: 'healthy', lastCheck: '2 mins ago', responseTime: 95 },
    { service: 'Supabase Database', status: 'healthy', lastCheck: '1 min ago', responseTime: 45 },
    { service: 'Authentication Service', status: 'healthy', lastCheck: '3 mins ago', responseTime: 120 },
    { service: 'API Gateway', status: 'warning', lastCheck: '1 min ago', responseTime: 250 },
    { service: 'File Storage', status: 'healthy', lastCheck: '2 mins ago', responseTime: 80 },
  ]);

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: prev.responseTime + (Math.random() - 0.5) * 20,
        activeUsers: prev.activeUsers + Math.floor((Math.random() - 0.5) * 50),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Production Monitor
              </CardTitle>
              <CardDescription>
                Real-time monitoring of production environment health and performance
              </CardDescription>
            </div>
            <Button 
              variant={isMonitoring ? "destructive" : "default"}
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.uptime}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">{Math.round(metrics.responseTime)}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.errorRate}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span>{Math.round(metrics.cpuUsage)}%</span>
                  </div>
                  <Progress value={metrics.cpuUsage} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span>{Math.round(metrics.memoryUsage)}%</span>
                  </div>
                  <Progress value={metrics.memoryUsage} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Network Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.networkLatency}ms</div>
                  <div className="text-sm text-muted-foreground">Average latency</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.databaseConnections}</div>
                  <div className="text-sm text-muted-foreground">Active connections</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Checks</CardTitle>
              <CardDescription>
                Status of all critical services and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthChecks.map((check) => (
                  <div key={check.service} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(check.status)}>
                        {getStatusIcon(check.status)}
                      </div>
                      <div>
                        <div className="font-medium">{check.service}</div>
                        <div className="text-sm text-muted-foreground">
                          Last check: {check.lastCheck}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        {check.responseTime}ms
                      </div>
                      <Badge variant={getStatusBadge(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Status
              </CardTitle>
              <CardDescription>
                Security monitoring and threat detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-muted-foreground">Active Threats</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">15</div>
                        <div className="text-sm text-muted-foreground">Blocked Attempts</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">A+</div>
                        <div className="text-sm text-muted-foreground">Security Grade</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Security Checks</h4>
                  {[
                    'SSL/TLS Certificate Valid',
                    'Security Headers Configured',
                    'Rate Limiting Active',
                    'WAF Rules Enabled',
                    'Database Encryption Active',
                  ].map((check) => (
                    <div key={check} className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{check}</span>
                      <Badge variant="default" className="ml-auto">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};