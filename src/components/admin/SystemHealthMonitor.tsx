import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMultiStackServices } from '@/hooks/useMultiStackServices';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
  last_check: string;
  endpoint: string;
}

export const SystemHealthMonitor = () => {
  const { performanceOperation } = useMultiStackServices();
  const [healthStatus, setHealthStatus] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      const services = [
        { name: 'Python ML Service', endpoint: 'http://localhost:8001/health' },
        { name: 'Go Performance Service', endpoint: 'http://localhost:8002/health' },
        { name: 'Node.js Real-time Service', endpoint: 'http://localhost:8003/health' },
        { name: 'Redis Cache', endpoint: 'redis://localhost:6379' },
        { name: 'Elasticsearch', endpoint: 'http://localhost:9200/_cluster/health' },
        { name: 'MongoDB', endpoint: 'mongodb://localhost:27017' }
      ];

      const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
          const startTime = Date.now();
          try {
            // This would normally make actual health check requests
            // For demo purposes, we'll simulate responses
            const isHealthy = Math.random() > 0.1; // 90% healthy simulation
            const responseTime = Math.random() * 100 + 10;
            
            return {
              name: service.name,
              status: isHealthy ? 'healthy' as const : 'degraded' as const,
              response_time: responseTime,
              last_check: new Date().toISOString(),
              endpoint: service.endpoint
            };
          } catch (error) {
            return {
              name: service.name,
              status: 'down' as const,
              response_time: Date.now() - startTime,
              last_check: new Date().toISOString(),
              endpoint: service.endpoint
            };
          }
        })
      );

      const healthResults = healthChecks.map((result, index) => 
        result.status === 'fulfilled' ? result.value : {
          name: services[index].name,
          status: 'down' as const,
          response_time: 0,
          last_check: new Date().toISOString(),
          endpoint: services[index].endpoint
        }
      );

      setHealthStatus(healthResults);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive'
    } as const;
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const criticalIssues = healthStatus.filter(service => service.status === 'down');
  const warnings = healthStatus.filter(service => service.status === 'degraded');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Health Monitor</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalIssues.length} critical service{criticalIssues.length > 1 ? 's' : ''} down. 
            Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {warnings.length} service{warnings.length > 1 ? 's' : ''} experiencing degraded performance.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthStatus.map((service) => (
          <Card key={service.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{service.name}</span>
                {getStatusIcon(service.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={getStatusBadge(service.status)}>
                  {service.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-mono">
                  {service.response_time.toFixed(0)}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Check</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(service.last_check).toLocaleTimeString()}
                </span>
              </div>

              <div className="text-xs text-muted-foreground truncate">
                {service.endpoint}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {healthStatus.filter(s => s.status === 'healthy').length}
              </div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {healthStatus.filter(s => s.status === 'degraded').length}
              </div>
              <div className="text-sm text-muted-foreground">Degraded</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {healthStatus.filter(s => s.status === 'down').length}
              </div>
              <div className="text-sm text-muted-foreground">Down</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};