import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProviderMetrics } from '@/hooks/useProviderMetrics';
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface GenerationAnalyticsProps {
  providers: string[];
  className?: string;
}

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const getPerformanceBadgeVariant = (performance: string) => {
  switch (performance) {
    case 'excellent': return 'default';
    case 'good': return 'secondary';
    case 'fair': return 'outline';
    case 'poor': return 'destructive';
    default: return 'outline';
  }
};

export const GenerationAnalytics: React.FC<GenerationAnalyticsProps> = ({
  providers,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getProviderStats, getBestPerformingProvider } = useProviderMetrics();
  
  const bestProvider = getBestPerformingProvider(providers);
  const providerStats = providers.map(provider => ({
    provider,
    stats: getProviderStats(provider)
  }));

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Generation Analytics
            {bestProvider && (
              <Badge variant="secondary" className="text-xs">
                Best: {bestProvider.toUpperCase()}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {providerStats.map(({ provider, stats }) => (
              <div
                key={provider}
                className="p-3 rounded-lg border border-border/50 bg-card/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {provider.toUpperCase()}
                    </span>
                    {provider === bestProvider && (
                      <Badge variant="default" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Best
                      </Badge>
                    )}
                  </div>
                  <Badge 
                    variant={getPerformanceBadgeVariant(stats.recentPerformance)}
                    className="text-xs capitalize"
                  >
                    {stats.recentPerformance}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Success:</span>
                    <span className="font-medium">{stats.successRate.toFixed(0)}%</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Avg Time:</span>
                    <span className="font-medium">{formatTime(stats.averageTime)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3 text-purple-500" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{stats.totalGenerations}</span>
                  </div>
                </div>
                
                {stats.successRate < 80 && stats.totalGenerations > 5 && (
                  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
                    <XCircle className="h-3 w-3 inline mr-1" />
                    Consider using a different provider for better reliability
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            Analytics based on recent generation history. Performance ratings consider success rate and speed.
          </div>
        </CardContent>
      )}
    </Card>
  );
};