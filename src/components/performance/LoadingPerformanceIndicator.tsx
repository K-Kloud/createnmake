import React from 'react';
import { usePerformanceMonitoringContext } from '@/providers/PerformanceMonitoringProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const LoadingPerformanceIndicator: React.FC = () => {
  const { metrics, isMonitoring } = usePerformanceMonitoringContext();

  const formatTime = (time: number | null): string => {
    if (time === null) return 'N/A';
    if (time < 1000) return `${time.toFixed(0)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getPerformanceScore = (): number => {
    if (!metrics.appLoadTime) return 0;
    
    // Simple scoring: under 2s = 100, under 4s = 75, under 6s = 50, over 6s = 25
    if (metrics.appLoadTime < 2000) return 100;
    if (metrics.appLoadTime < 4000) return 75;
    if (metrics.appLoadTime < 6000) return 50;
    return 25;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const score = getPerformanceScore();
  const componentCount = Object.keys(metrics.componentMountTimes).length;

  if (!isMonitoring) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Loading Performance
          {isMonitoring && (
            <Badge variant="outline" className="ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Performance Score</span>
            <span className={`text-sm font-bold ${getScoreColor(score)}`}>
              {score}/100
            </span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* App Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">App Load Time</span>
          </div>
          <span className="text-sm font-medium">
            {formatTime(metrics.appLoadTime)}
          </span>
        </div>

        {/* Critical Resources */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Critical Resources</span>
          </div>
          <span className="text-sm font-medium">
            {metrics.criticalResourcesLoaded}
          </span>
        </div>

        {/* Components Loaded */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Components Loaded</span>
          </div>
          <span className="text-sm font-medium">
            {componentCount}
          </span>
        </div>

        {/* Error Boundaries */}
        {metrics.errorBoundaryTriggers > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Error Boundaries</span>
            </div>
            <Badge variant="destructive" className="text-xs">
              {metrics.errorBoundaryTriggers}
            </Badge>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {new Date(metrics.lastUpdateTime).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};