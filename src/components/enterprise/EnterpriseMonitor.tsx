import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Users, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi
} from 'lucide-react';
import { SecurityMonitor } from '../monitoring/SecurityMonitor';
import { AdvancedAnalytics } from '../monitoring/AdvancedAnalytics';
import { CacheManager } from '../caching/CacheManager';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  active_connections: number;
  error_rate: number;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  response_time: number;
  last_check: string;
  uptime_percentage: number;
}

export const EnterpriseMonitor: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      // Simulate monitoring data - in real app, this would come from your monitoring service
      const mockHealth: SystemHealth = {
        status: 'healthy',
        uptime: 99.97,
        cpu_usage: 35.6,
        memory_usage: 68.2,
        disk_usage: 42.8,
        network_latency: 45,
        active_connections: 1247,
        error_rate: 0.03
      };

      const mockServices: ServiceStatus[] = [
        {
          name: 'API Gateway',
          status: 'online',
          response_time: 120,
          last_check: new Date().toISOString(),
          uptime_percentage: 99.98
        },
        {
          name: 'Database',
          status: 'online',
          response_time: 85,
          last_check: new Date().toISOString(),
          uptime_percentage: 99.95
        },
        {
          name: 'Cache Layer',
          status: 'online',
          response_time: 15,
          last_check: new Date().toISOString(),
          uptime_percentage: 99.99
        },
        {
          name: 'ML Services',
          status: 'degraded',
          response_time: 850,
          last_check: new Date().toISOString(),
          uptime_percentage: 98.67
        },
        {
          name: 'Storage',
          status: 'online',
          response_time: 65,
          last_check: new Date().toISOString(),
          uptime_percentage: 99.92
        },
        {
          name: 'Notifications',
          status: 'online',
          response_time: 210,
          last_check: new Date().toISOString(),
          uptime_percentage: 99.88
        }
      ];

      setSystemHealth(mockHealth);
      setServices(mockServices);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'degraded':
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'offline':
      case 'critical':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Loading enterprise monitoring data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Enterprise Monitor</h2>
          <p className="text-muted-foreground">Comprehensive system monitoring and observability</p>
        </div>
        <div className="flex items-center gap-2">
          {systemHealth && getStatusIcon(systemHealth.status)}
          <span className="text-sm font-medium capitalize">
            System {systemHealth?.status}
          </span>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.cpu_usage.toFixed(1)}%</div>
            <Progress value={systemHealth?.cpu_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <MemoryStick className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.memory_usage.toFixed(1)}%</div>
            <Progress value={systemHealth?.memory_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.disk_usage.toFixed(1)}%</div>
            <Progress value={systemHealth?.disk_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{systemHealth?.uptime.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.active_connections} active connections
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="caching">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time status of all microservices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.response_time}ms response • {service.uptime_percentage}% uptime
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(service.status)}
                    >
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <SecurityMonitor />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="caching">
          <CacheManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};