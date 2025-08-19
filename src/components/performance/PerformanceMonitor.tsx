import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { useResourceMonitor } from '@/hooks/useResourceMonitor';

interface PerformanceScore {
  overall: number;
  loading: number;
  interactivity: number;
  stability: number;
}

export const PerformanceMonitor: React.FC = () => {
  const { metrics, isLoading } = usePerformanceMetrics();
  const { resources, memoryUsage, networkStatus } = useResourceMonitor();
  const [performanceScore, setPerformanceScore] = useState<PerformanceScore>({
    overall: 0,
    loading: 0,
    interactivity: 0,
    stability: 0
  });

  useEffect(() => {
    if (metrics) {
      // Calculate performance scores based on Core Web Vitals
      const loadingScore = Math.max(0, 100 - (metrics.fcp / 20)); // FCP target: 2s
      const interactivityScore = Math.max(0, 100 - (metrics.fid / 10)); // FID target: 100ms
      const stabilityScore = Math.max(0, 100 - (metrics.cls * 1000)); // CLS target: 0.1
      const overall = (loadingScore + interactivityScore + stabilityScore) / 3;

      setPerformanceScore({
        overall,
        loading: loadingScore,
        interactivity: interactivityScore,
        stability: stabilityScore
      });
    }
  }, [metrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>
            Real-time performance metrics based on Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(performanceScore.overall)}`}>
                {Math.round(performanceScore.overall)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <Badge variant={getScoreBadgeVariant(performanceScore.overall)}>
                {performanceScore.overall >= 90 ? 'Excellent' : 
                 performanceScore.overall >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Loading</span>
                <span className={getScoreColor(performanceScore.loading)}>
                  {Math.round(performanceScore.loading)}
                </span>
              </div>
              <Progress value={performanceScore.loading} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Interactivity</span>
                <span className={getScoreColor(performanceScore.interactivity)}>
                  {Math.round(performanceScore.interactivity)}
                </span>
              </div>
              <Progress value={performanceScore.interactivity} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Visual Stability</span>
                <span className={getScoreColor(performanceScore.stability)}>
                  {Math.round(performanceScore.stability)}
                </span>
              </div>
              <Progress value={performanceScore.stability} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  First Contentful Paint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.fcp ? `${metrics.fcp.toFixed(2)}s` : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Target: {'<'}2.0s
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  First Input Delay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Target: {'<'}100ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Cumulative Layout Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Target: {'<'}0.1
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used Memory</span>
                    <span>{memoryUsage.used}MB</span>
                  </div>
                  <Progress value={memoryUsage.percentage} className="h-2" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Available: {memoryUsage.total}MB
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Resource Loading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resources.map((resource, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="truncate flex-1 mr-2">{resource.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{resource.duration}ms</span>
                      {resource.status === 'success' ? (
                        <CheckCircle className="h-3 w-3 text-success" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-warning" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Network Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Connection Type</div>
                  <div className="font-medium">{networkStatus.effectiveType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Downlink Speed</div>
                  <div className="font-medium">{networkStatus.downlink} Mbps</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Round Trip Time</div>
                  <div className="font-medium">{networkStatus.rtt}ms</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Save Data</div>
                  <div className="font-medium">{networkStatus.saveData ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve your application's performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceScore.loading < 70 && (
                <div className="flex gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <div className="font-medium">Improve Loading Performance</div>
                    <div className="text-sm text-muted-foreground">
                      Consider optimizing images, enabling compression, and implementing lazy loading.
                    </div>
                  </div>
                </div>
              )}
              
              {performanceScore.interactivity < 70 && (
                <div className="flex gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <div className="font-medium">Reduce Interactivity Delays</div>
                    <div className="text-sm text-muted-foreground">
                      Minimize JavaScript execution time and optimize event handlers.
                    </div>
                  </div>
                </div>
              )}
              
              {performanceScore.stability < 70 && (
                <div className="flex gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <div className="font-medium">Improve Visual Stability</div>
                    <div className="text-sm text-muted-foreground">
                      Set explicit dimensions for images and avoid inserting content above existing content.
                    </div>
                  </div>
                </div>
              )}

              {performanceScore.overall >= 90 && (
                <div className="flex gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <div className="font-medium">Excellent Performance!</div>
                    <div className="text-sm text-muted-foreground">
                      Your application is performing well. Keep monitoring for consistent results.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};