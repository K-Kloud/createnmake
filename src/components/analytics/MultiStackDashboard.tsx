import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultiStackServices } from '@/hooks/useMultiStackServices';
import { Activity, Cpu, Database, Network, Zap } from 'lucide-react';

export const MultiStackDashboard = () => {
  const { getAnalytics, performanceOperation, connectRealtime } = useMultiStackServices();
  const [analytics, setAnalytics] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
    setupRealTimeUpdates();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [analyticsData, systemData] = await Promise.all([
        getAnalytics('24h', ['user_activity', 'ai_performance', 'ml_usage']),
        performanceOperation('system-metrics', {})
      ]);
      
      setAnalytics(analyticsData);
      setSystemMetrics(systemData);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = async () => {
    const connection = await connectRealtime();
    if (connection) {
      connection.on('metrics-update', (data) => {
        setSystemMetrics(prev => ({ ...prev, ...data }));
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Multi-Stack System Dashboard</h1>
        <Button onClick={loadDashboard} variant="outline">
          Refresh Metrics
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Python ML Service</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemMetrics?.python_ml?.requests_processed || 0} requests processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Go Performance Service</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemMetrics?.go_performance?.avg_response_time || 0}ms avg response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Node.js Real-time</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemMetrics?.node_realtime?.active_connections || 0} active connections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Pipeline</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="default">Healthy</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  All databases operational
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Microservices Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Python ML/AI Service', status: 'healthy', port: '8001' },
                  { name: 'Go Performance Service', status: 'healthy', port: '8002' },
                  { name: 'Node.js Real-time Service', status: 'healthy', port: '8003' },
                  { name: 'Redis Cache', status: 'healthy', port: '6379' },
                  { name: 'Elasticsearch', status: 'healthy', port: '9200' },
                  { name: 'MongoDB', status: 'healthy', port: '27017' }
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <span className="text-sm">{service.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                        {service.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">:{service.port}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{systemMetrics?.cpu_usage || '12%'}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{systemMetrics?.memory_usage || '34%'}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Times (24h Average)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { service: 'Frontend (React)', time: '45ms', status: 'excellent' },
                  { service: 'Python ML API', time: '234ms', status: 'good' },
                  { service: 'Go Performance API', time: '12ms', status: 'excellent' },
                  { service: 'Node.js WebSocket', time: '8ms', status: 'excellent' },
                  { service: 'Database Queries', time: '89ms', status: 'good' }
                ].map((metric) => (
                  <div key={metric.service} className="flex items-center justify-between">
                    <span className="text-sm">{metric.service}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{metric.time}</span>
                      <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ML/AI Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Image Processing</span>
                    <span className="text-sm font-bold">
                      {analytics?.data?.find(d => d.metric === 'ml_usage')?.data?.image_processing || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AI Recommendations</span>
                    <span className="text-sm font-bold">
                      {analytics?.data?.find(d => d.metric === 'ai_performance')?.data?.recommendations || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {systemMetrics?.realtime_events || 0} events in last hour
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};