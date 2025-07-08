import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnhancedRealtimeFeatures } from '@/hooks/useEnhancedRealtimeFeatures';
import { LoadingState } from '@/components/ui/loading-state';
import { 
  Activity, 
  Database, 
  Server, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const getComponentIcon = (componentName: string) => {
  switch (componentName) {
    case 'database':
      return <Database className="h-4 w-4" />;
    case 'api':
      return <Server className="h-4 w-4" />;
    case 'storage':
      return <Wifi className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getStatusColor = (alertThresholdExceeded: boolean) => {
  return alertThresholdExceeded ? 'text-red-600' : 'text-green-600';
};

const getStatusIcon = (alertThresholdExceeded: boolean) => {
  return alertThresholdExceeded ? 
    <AlertTriangle className="h-4 w-4" /> : 
    <CheckCircle className="h-4 w-4" />;
};

const formatMetricValue = (value: number, unit: string) => {
  if (unit === 'ms') {
    return `${value.toFixed(2)}ms`;
  } else if (unit === 'percentage') {
    return `${value.toFixed(1)}%`;
  } else if (unit === 'bytes') {
    if (value > 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024 * 1024)).toFixed(2)}GB`;
    } else if (value > 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)}MB`;
    } else if (value > 1024) {
      return `${(value / 1024).toFixed(2)}KB`;
    }
    return `${value}B`;
  }
  return value.toString();
};

export const RealtimeSystemMonitor: React.FC = () => {
  const { useSystemHealthMetrics, trackSystemHealthMetric } = useEnhancedRealtimeFeatures();
  const { data: metrics, isLoading, error } = useSystemHealthMetrics();

  // Group metrics by component
  const groupedMetrics = metrics?.reduce((acc, metric) => {
    if (!acc[metric.component_name]) {
      acc[metric.component_name] = [];
    }
    acc[metric.component_name].push(metric);
    return acc;
  }, {} as Record<string, typeof metrics>) || {};

  // Simulate tracking a metric (for demo purposes)
  const trackDemoMetric = () => {
    trackSystemHealthMetric.mutate({
      metricName: 'api_response_time',
      metricValue: Math.random() * 1000,
      metricUnit: 'ms',
      componentName: 'api',
      metadata: { endpoint: '/api/test' },
      alertThresholdExceeded: Math.random() > 0.8
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">System Health Monitor</h2>
          <p className="text-muted-foreground">Real-time system performance metrics</p>
        </div>
        <button 
          onClick={trackDemoMetric}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Track Demo Metric
        </button>
      </div>

      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingMessage="Loading system metrics..."
        errorMessage="Failed to load system metrics"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedMetrics).map(([componentName, componentMetrics]) => {
            const latestMetrics = componentMetrics?.slice(0, 5) || [];
            const hasAlerts = latestMetrics.some(m => m.alert_threshold_exceeded);
            
            return (
              <Card key={componentName} className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getComponentIcon(componentName)}
                    <span className="capitalize">{componentName}</span>
                    <Badge 
                      variant={hasAlerts ? 'destructive' : 'default'}
                      className="ml-auto"
                    >
                      {hasAlerts ? 'Alert' : 'Healthy'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {latestMetrics.length > 0 ? (
                    latestMetrics.map((metric) => {
                      const trend = componentMetrics.length > 1 ? 
                        (metric.metric_value > componentMetrics[1]?.metric_value ? 'up' : 'down') : 
                        'stable';
                      
                      return (
                        <div key={metric.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={getStatusColor(metric.alert_threshold_exceeded)}>
                              {getStatusIcon(metric.alert_threshold_exceeded)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{metric.metric_name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(metric.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm">
                                {formatMetricValue(metric.metric_value, metric.metric_unit)}
                              </span>
                              {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                              {trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No metrics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {Object.keys(groupedMetrics).length === 0 && (
          <Card className="glass-card">
            <CardContent className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No System Metrics</h3>
              <p className="text-muted-foreground">
                System health metrics will appear here as the system runs.
              </p>
            </CardContent>
          </Card>
        )}
      </LoadingState>
    </div>
  );
};