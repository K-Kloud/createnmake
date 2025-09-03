import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  RefreshCw,
  Play,
  Pause,
  Bell
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RealtimeMetric {
  provider: string;
  success_rate: number;
  avg_response_time: number;
  requests_per_minute: number;
  error_count: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  last_updated: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  enabled: boolean;
  triggered: boolean;
}

interface TimeSeriesPoint {
  timestamp: string;
  openai: number;
  gemini: number;
  xai: number;
}

export const RealtimeMonitoring = () => {
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeMonitoring();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeMonitoring = async () => {
    // Initialize with mock data
    const initialMetrics: RealtimeMetric[] = [
      {
        provider: 'openai',
        success_rate: 96.5,
        avg_response_time: 3.2,
        requests_per_minute: 47,
        error_count: 2,
        status: 'healthy',
        last_updated: new Date().toISOString()
      },
      {
        provider: 'gemini',
        success_rate: 94.1,
        avg_response_time: 2.8,
        requests_per_minute: 33,
        error_count: 1,
        status: 'healthy',
        last_updated: new Date().toISOString()
      },
      {
        provider: 'xai',
        success_rate: 89.7,
        avg_response_time: 4.1,
        requests_per_minute: 28,
        error_count: 3,
        status: 'degraded',
        last_updated: new Date().toISOString()
      }
    ];

    const initialAlertRules: AlertRule[] = [
      {
        id: '1',
        name: 'Success Rate Drop',
        metric: 'success_rate',
        operator: 'less_than',
        threshold: 90,
        enabled: true,
        triggered: false
      },
      {
        id: '2',
        name: 'High Response Time',
        metric: 'avg_response_time',
        operator: 'greater_than',
        threshold: 5.0,
        enabled: true,
        triggered: false
      },
      {
        id: '3',
        name: 'Error Count Spike',
        metric: 'error_count',
        operator: 'greater_than',
        threshold: 5,
        enabled: true,
        triggered: false
      }
    ];

    setMetrics(initialMetrics);
    setAlertRules(initialAlertRules);

    // Generate initial time series data
    const initialTimeSeries: TimeSeriesPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60000).toISOString();
      initialTimeSeries.push({
        timestamp,
        openai: 95 + Math.random() * 5,
        gemini: 93 + Math.random() * 6,
        xai: 88 + Math.random() * 8
      });
    }
    setTimeSeries(initialTimeSeries);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    intervalRef.current = setInterval(() => {
      updateMetrics();
      checkAlerts();
    }, 5000); // Update every 5 seconds
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateMetrics = async () => {
    try {
      // Simulate real-time metric updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        success_rate: Math.max(85, Math.min(100, metric.success_rate + (Math.random() - 0.5) * 2)),
        avg_response_time: Math.max(1.0, metric.avg_response_time + (Math.random() - 0.5) * 0.5),
        requests_per_minute: Math.max(0, metric.requests_per_minute + Math.floor((Math.random() - 0.5) * 10)),
        error_count: Math.max(0, metric.error_count + Math.floor((Math.random() - 0.7) * 3)),
        status: getHealthStatus(metric.success_rate, metric.avg_response_time),
        last_updated: new Date().toISOString()
      })));

      // Update time series
      setTimeSeries(prev => {
        const newPoint: TimeSeriesPoint = {
          timestamp: new Date().toISOString(),
          openai: 95 + Math.random() * 5,
          gemini: 93 + Math.random() * 6,
          xai: 88 + Math.random() * 8
        };
        return [...prev.slice(1), newPoint];
      });

      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  const checkAlerts = () => {
    setAlertRules(prev => prev.map(rule => {
      if (!rule.enabled) return rule;

      const shouldTrigger = metrics.some(metric => {
        const value = metric[rule.metric as keyof RealtimeMetric] as number;
        
        switch (rule.operator) {
          case 'greater_than':
            return value > rule.threshold;
          case 'less_than':
            return value < rule.threshold;
          default:
            return false;
        }
      });

      if (shouldTrigger && !rule.triggered) {
        toast({
          variant: "destructive",
          title: "Alert Triggered",
          description: `${rule.name}: Threshold exceeded`,
          duration: 5000,
        });
      }

      return { ...rule, triggered: shouldTrigger };
    }));
  };

  const triggerManualCheck = async () => {
    try {
      // Call the realtime analytics processor
      const response = await supabase.functions.invoke('realtime-analytics-processor');
      
      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Manual Check Complete",
        description: "Analytics processing completed successfully"
      });

      // Refresh metrics after manual check
      await updateMetrics();

    } catch (error) {
      console.error('Error in manual check:', error);
      toast({
        variant: "destructive",
        title: "Manual Check Failed",
        description: "Failed to process analytics"
      });
    }
  };

  const getHealthStatus = (successRate: number, responseTime: number): 'healthy' | 'degraded' | 'unhealthy' => {
    if (successRate >= 95 && responseTime < 4.0) return 'healthy';
    if (successRate >= 85 && responseTime < 6.0) return 'degraded';
    return 'unhealthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'GPT-Image-1';
      case 'gemini': return 'Gemini 2.5 Flash';
      case 'xai': return 'Grok 4';
      default: return provider.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Realtime Monitoring</h1>
          <p className="text-muted-foreground">
            Live performance metrics and alerting • Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={triggerManualCheck}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Manual Check
          </Button>
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.provider}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {formatProviderName(metric.provider)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metric.status)}
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">{metric.success_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metric.success_rate} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Response</span>
                      </div>
                      <div className="font-medium">{metric.avg_response_time.toFixed(1)}s</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>Requests/min</span>
                      </div>
                      <div className="font-medium">{metric.requests_per_minute}</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Errors</span>
                    <span className={`font-medium ${metric.error_count > 3 ? 'text-red-600' : 'text-green-600'}`}>
                      {metric.error_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Rate Trends (Last 30 minutes)</CardTitle>
              <CardDescription>Real-time performance tracking across providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis domain={[80, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
                  />
                  <Line type="monotone" dataKey="openai" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="gemini" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  <Line type="monotone" dataKey="xai" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alertRules.map((rule) => (
              <Card key={rule.id} className={rule.triggered ? 'border-red-200 bg-red-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                      </div>
                      {rule.triggered && (
                        <Badge variant="destructive" className="animate-pulse">
                          TRIGGERED
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => {
                        setAlertRules(prev => prev.map(r => 
                          r.id === rule.id ? { ...r, enabled: checked } : r
                        ));
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Metric: <span className="font-medium">{rule.metric}</span></span>
                    <span>Condition: <span className="font-medium">{rule.operator} {rule.threshold}</span></span>
                    <span>Status: <span className={`font-medium ${rule.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};