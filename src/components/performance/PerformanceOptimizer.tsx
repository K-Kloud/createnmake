import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  TrendingUp, 
  Database, 
  Server, 
  Network,
  Timer,
  Gauge,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  throughput: number;
  error_rate: number;
  cache_hit_ratio: number;
  db_query_time: number;
  network_latency: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  action: string;
}

export const PerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      // Simulate performance metrics
      const mockMetrics: PerformanceMetrics = {
        cpu_usage: Math.random() * 100,
        memory_usage: 60 + Math.random() * 30,
        response_time: 150 + Math.random() * 100,
        throughput: 800 + Math.random() * 400,
        error_rate: Math.random() * 2,
        cache_hit_ratio: 85 + Math.random() * 10,
        db_query_time: 50 + Math.random() * 50,
        network_latency: 20 + Math.random() * 30
      };

      const mockSuggestions: OptimizationSuggestion[] = [
        {
          id: '1',
          type: 'critical',
          title: 'Database Query Optimization',
          description: 'Several slow queries detected causing performance bottlenecks',
          impact: 'high',
          effort: 'medium',
          action: 'Add database indexes and optimize slow queries'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Memory Usage High',
          description: 'Memory usage is approaching critical levels',
          impact: 'medium',
          effort: 'low',
          action: 'Implement memory cleanup and garbage collection'
        },
        {
          id: '3',
          type: 'info',
          title: 'Cache Optimization',
          description: 'Cache hit ratio could be improved',
          impact: 'medium',
          effort: 'medium',
          action: 'Implement more aggressive caching strategies'
        }
      ];

      setMetrics(mockMetrics);
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  const startOptimization = async () => {
    setIsOptimizing(true);
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Optimization Complete",
        description: "Performance optimizations have been applied successfully."
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to apply performance optimizations.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }, inverted = false) => {
    if (inverted) {
      if (value < thresholds.critical) return 'critical';
      if (value < thresholds.warning) return 'warning';
      return 'good';
    } else {
      if (value > thresholds.critical) return 'critical';
      if (value > thresholds.warning) return 'warning';
      return 'good';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default: return 'text-green-500 bg-green-50 border-green-200';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'critical': return <Zap className="w-4 h-4 text-red-500" />;
      case 'warning': return <Timer className="w-4 h-4 text-yellow-500" />;
      default: return <TrendingUp className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 animate-spin" />
            Loading performance data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Performance Optimizer</h2>
          <p className="text-muted-foreground">AI-powered performance monitoring and optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={startOptimization}
            disabled={isOptimizing}
            className="gap-2"
          >
            {isOptimizing ? (
              <>
                <Pause className="w-4 h-4" />
                Optimizing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Optimization
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAutoOptimize(!autoOptimize)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Auto: {autoOptimize ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu_usage.toFixed(1)}%</div>
            <Progress value={metrics.cpu_usage} className="mt-2" />
            <Badge 
              variant="outline" 
              className={`mt-2 ${getStatusColor(getMetricStatus(metrics.cpu_usage, { warning: 70, critical: 90 }))}`}
            >
              {getMetricStatus(metrics.cpu_usage, { warning: 70, critical: 90 })}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory_usage.toFixed(1)}%</div>
            <Progress value={metrics.memory_usage} className="mt-2" />
            <Badge 
              variant="outline" 
              className={`mt-2 ${getStatusColor(getMetricStatus(metrics.memory_usage, { warning: 80, critical: 95 }))}`}
            >
              {getMetricStatus(metrics.memory_usage, { warning: 80, critical: 95 })}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Timer className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.response_time.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground mt-2">
              Throughput: {metrics.throughput.toFixed(0)} req/s
            </p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getStatusColor(getMetricStatus(metrics.response_time, { warning: 200, critical: 500 }))}`}
            >
              {getMetricStatus(metrics.response_time, { warning: 200, critical: 500 })}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cache_hit_ratio.toFixed(1)}%</div>
            <Progress value={metrics.cache_hit_ratio} className="mt-2" />
            <Badge 
              variant="outline" 
              className={`mt-2 ${getStatusColor(getMetricStatus(metrics.cache_hit_ratio, { warning: 80, critical: 60 }, true))}`}
            >
              {getMetricStatus(metrics.cache_hit_ratio, { warning: 80, critical: 60 }, true)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suggestions">Optimization Suggestions</TabsTrigger>
          <TabsTrigger value="history">Optimization History</TabsTrigger>
          <TabsTrigger value="settings">Auto-Optimization Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Suggestions</CardTitle>
              <CardDescription>Performance optimization recommendations based on current metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(suggestion.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge variant="outline" className={getStatusColor(suggestion.type)}>
                            {suggestion.type}
                          </Badge>
                          <Badge variant="secondary">
                            Impact: {suggestion.impact}
                          </Badge>
                          <Badge variant="secondary">
                            Effort: {suggestion.effort}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <p className="text-sm font-medium">
                          Recommended Action: {suggestion.action}
                        </p>
                      </div>
                      <Button size="sm">
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Optimization History</CardTitle>
              <CardDescription>Recent performance optimization activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Database Index Optimization</h4>
                      <p className="text-sm text-muted-foreground">Added indexes to slow queries</p>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-1">Completed</Badge>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Memory Cleanup</h4>
                      <p className="text-sm text-muted-foreground">Implemented garbage collection optimization</p>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-1">Completed</Badge>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Optimization Settings</CardTitle>
              <CardDescription>Configure automatic performance optimization rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Auto-Optimization</h4>
                    <p className="text-sm text-muted-foreground">Automatically apply low-risk optimizations</p>
                  </div>
                  <Button
                    variant={autoOptimize ? "default" : "outline"}
                    onClick={() => setAutoOptimize(!autoOptimize)}
                  >
                    {autoOptimize ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alert Thresholds</h4>
                    <p className="text-sm text-muted-foreground">Configure when to trigger alerts</p>
                  </div>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};