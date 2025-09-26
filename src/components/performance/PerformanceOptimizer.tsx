import React, { useState, useEffect } from 'react';
import { useMultiStackServices } from '@/hooks/useMultiStackServices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Database, 
  Globe, 
  Server, 
  Monitor, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRatio: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'cache' | 'database' | 'cdn' | 'compression';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  implemented: boolean;
}

export const PerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    responseTime: 120,
    throughput: 850,
    errorRate: 0.2,
    cacheHitRatio: 78
  });

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: '1',
      type: 'cache',
      priority: 'high',
      title: 'Implement Redis Caching',
      description: 'Add Redis caching layer for frequently accessed data',
      impact: '+40% performance improvement',
      implemented: false
    },
    {
      id: '2',
      type: 'database',
      priority: 'medium',
      title: 'Optimize Database Queries',
      description: 'Add indexes and optimize slow queries',
      impact: '+25% query performance',
      implemented: false
    },
    {
      id: '3',
      type: 'cdn',
      priority: 'medium',
      title: 'CDN Integration',
      description: 'Integrate CDN for static asset delivery',
      impact: '+60% load time reduction',
      implemented: false
    },
    {
      id: '4',
      type: 'compression',
      priority: 'low',
      title: 'Enable Compression',
      description: 'Enable gzip/brotli compression for responses',
      impact: '+30% bandwidth savings',
      implemented: true
    }
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const { performanceOperation, getAnalytics } = useMultiStackServices();

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 20)),
        throughput: Math.max(100, Math.min(2000, prev.throughput + (Math.random() - 0.5) * 50)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.2)),
        cacheHitRatio: Math.max(50, Math.min(95, prev.cacheHitRatio + (Math.random() - 0.5) * 3))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const implementOptimization = async (suggestionId: string) => {
    setIsOptimizing(true);
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      // Call Go performance service to implement optimization
      await performanceOperation('implement-optimization', {
        type: suggestion.type,
        config: {
          priority: suggestion.priority,
          target_metrics: ['response_time', 'throughput']
        }
      });

      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId ? { ...s, implemented: true } : s
      ));

      // Simulate metrics improvement
      setTimeout(() => {
        if (suggestion.type === 'cache') {
          setMetrics(prev => ({
            ...prev,
            responseTime: Math.max(50, prev.responseTime * 0.7),
            cacheHitRatio: Math.min(95, prev.cacheHitRatio + 15)
          }));
        } else if (suggestion.type === 'database') {
          setMetrics(prev => ({
            ...prev,
            responseTime: Math.max(50, prev.responseTime * 0.8),
            cpuUsage: Math.max(10, prev.cpuUsage - 10)
          }));
        }
      }, 2000);

    } catch (error) {
      console.error('Failed to implement optimization:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const runPerformanceAudit = async () => {
    setIsOptimizing(true);
    try {
      const auditResults = await performanceOperation('performance-audit', {
        metrics: ['response_time', 'throughput', 'error_rate', 'resource_usage'],
        analysis_depth: 'comprehensive'
      });

      console.log('Performance audit results:', auditResults);
      
      // Generate new suggestions based on audit
      const newSuggestions = auditResults.suggestions || [];
      setSuggestions(prev => [...prev, ...newSuggestions]);

    } catch (error) {
      console.error('Performance audit failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getMetricColor = (value: number, type: string) => {
    if (type === 'errorRate') {
      return value < 1 ? 'text-green-500' : value < 3 ? 'text-yellow-500' : 'text-red-500';
    }
    if (type === 'cacheHitRatio' || type === 'throughput') {
      return value > 80 ? 'text-green-500' : value > 60 ? 'text-yellow-500' : 'text-red-500';
    }
    // For CPU, memory, response time
    return value < 50 ? 'text-green-500' : value < 80 ? 'text-yellow-500' : 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cache': return <Database className="h-4 w-4" />;
      case 'database': return <Server className="h-4 w-4" />;
      case 'cdn': return <Globe className="h-4 w-4" />;
      case 'compression': return <Zap className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className={`font-medium ${getMetricColor(metrics.cpuUsage, 'cpuUsage')}`}>
                  {metrics.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className={`font-medium ${getMetricColor(metrics.memoryUsage, 'memoryUsage')}`}>
                  {metrics.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className={`font-medium ${getMetricColor(metrics.responseTime, 'responseTime')}`}>
                  {metrics.responseTime.toFixed(0)}ms
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Throughput</span>
                <span className={`font-medium ${getMetricColor(metrics.throughput, 'throughput')}`}>
                  {metrics.throughput.toFixed(0)} req/s
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className={`font-medium ${getMetricColor(metrics.errorRate, 'errorRate')}`}>
                  {metrics.errorRate.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cache Hit</span>
                <span className={`font-medium ${getMetricColor(metrics.cacheHitRatio, 'cacheHitRatio')}`}>
                  {metrics.cacheHitRatio.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cacheHitRatio} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Optimization Suggestions
            </CardTitle>
            <Button 
              onClick={runPerformanceAudit}
              disabled={isOptimizing}
              variant="outline"
            >
              {isOptimizing ? 'Analyzing...' : 'Run Audit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3">
                  {getTypeIcon(suggestion.type)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <Badge 
                        variant="secondary" 
                        className={getPriorityColor(suggestion.priority)}
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">{suggestion.impact}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {suggestion.implemented ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Implemented
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => implementOptimization(suggestion.id)}
                      disabled={isOptimizing}
                    >
                      Implement
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {Math.round(
                ((100 - metrics.cpuUsage) + 
                 (100 - metrics.memoryUsage) + 
                 Math.max(0, 100 - metrics.responseTime/5) + 
                 Math.min(100, metrics.throughput/10) + 
                 (100 - metrics.errorRate * 20) + 
                 metrics.cacheHitRatio) / 6
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Performance Score (out of 100)
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                {suggestions.filter(s => s.implemented).length} Optimizations
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                {suggestions.filter(s => !s.implemented).length} Pending
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};