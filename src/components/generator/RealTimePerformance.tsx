import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface RealTimePerformanceProps {
  currentProvider: string;
  isGenerating: boolean;
  generationStartTime?: number;
  className?: string;
}

export const RealTimePerformance: React.FC<RealTimePerformanceProps> = ({
  currentProvider,
  isGenerating,
  generationStartTime,
  className = ''
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedProgress, setEstimatedProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating || !generationStartTime) {
      setElapsedTime(0);
      setEstimatedProgress(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - generationStartTime;
      setElapsedTime(elapsed);
      
      // Estimate progress based on typical generation times
      const estimatedTotal = getEstimatedTime(currentProvider);
      const progress = Math.min((elapsed / estimatedTotal) * 100, 95);
      setEstimatedProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, generationStartTime, currentProvider]);

  const getEstimatedTime = (provider: string): number => {
    const baseTimes = {
      openai: 20000,    // 20 seconds
      gemini: 15000,    // 15 seconds  
      xai: 12000,       // 12 seconds
      huggingface: 25000 // 25 seconds
    };
    return baseTimes[provider as keyof typeof baseTimes] || 20000;
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getStatusColor = (): string => {
    if (!isGenerating) return 'text-muted-foreground';
    if (elapsedTime < 10000) return 'text-green-500';
    if (elapsedTime < 30000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (!isGenerating) return Activity;
    if (elapsedTime < 10000) return Zap;
    if (elapsedTime < 30000) return Clock;
    return AlertTriangle;
  };

  const StatusIcon = getStatusIcon();

  if (!isGenerating) {
    return (
      <Card className={`border-border/30 bg-card/30 ${className}`}>
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Ready to generate</span>
            <Badge variant="outline" className="text-xs ml-auto">
              {currentProvider.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/30 bg-primary/5 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${getStatusColor()}`} />
            Generating...
          </div>
          <Badge variant="secondary" className="text-xs">
            {currentProvider.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className={getStatusColor()}>
              {formatTime(elapsedTime)}
            </span>
          </div>
          <Progress 
            value={estimatedProgress} 
            className="h-2"
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          {elapsedTime > 30000 && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              Taking longer than usual...
            </div>
          )}
          {elapsedTime <= 10000 && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3" />
              Processing smoothly
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};