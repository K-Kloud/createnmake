import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star,
  Zap,
  Target
} from 'lucide-react';
import { useGenerationHistory } from '@/hooks/useGenerationHistory';
import { formatDistanceToNow } from 'date-fns';

interface GenerationStatsProps {
  className?: string;
}

export const GenerationStats: React.FC<GenerationStatsProps> = ({
  className = ''
}) => {
  const { history, favorites } = useGenerationHistory();

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        totalGenerations: 0,
        averageRating: 0,
        favoriteRate: 0,
        mostUsedProvider: null,
        mostUsedItemType: null,
        averageProcessingTime: 0,
        recentActivity: 0,
        providerStats: [],
        itemTypeStats: [],
        dailyActivity: []
      };
    }

    // Basic counts
    const totalGenerations = history.length;
    const totalFavorites = favorites.length;
    const favoriteRate = (totalFavorites / totalGenerations) * 100;

    // Ratings
    const ratedGenerations = history.filter(h => h.rating);
    const averageRating = ratedGenerations.length > 0
      ? ratedGenerations.reduce((sum, h) => sum + (h.rating || 0), 0) / ratedGenerations.length
      : 0;

    // Provider stats
    const providerCounts = history.reduce((acc, h) => {
      acc[h.provider] = (acc[h.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const providerStats = Object.entries(providerCounts)
      .map(([provider, count]) => ({
        provider,
        count,
        percentage: (count / totalGenerations) * 100,
        avgRating: history
          .filter(h => h.provider === provider && h.rating)
          .reduce((sum, h, _, arr) => sum + (h.rating || 0) / arr.length, 0) || 0
      }))
      .sort((a, b) => b.count - a.count);

    const mostUsedProvider = providerStats[0]?.provider || null;

    // Item type stats
    const itemTypeCounts = history.reduce((acc, h) => {
      acc[h.itemType] = (acc[h.itemType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const itemTypeStats = Object.entries(itemTypeCounts)
      .map(([itemType, count]) => ({
        itemType,
        count,
        percentage: (count / totalGenerations) * 100
      }))
      .sort((a, b) => b.count - a.count);

    const mostUsedItemType = itemTypeStats[0]?.itemType || null;

    // Processing time
    const processingTimes = history
      .filter(h => h.metadata?.processingTime)
      .map(h => h.metadata.processingTime);
    
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentActivity = history.filter(h => h.createdAt > sevenDaysAgo).length;

    // Daily activity for the last 7 days
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
      
      const count = history.filter(h => 
        h.createdAt >= dayStart && h.createdAt <= dayEnd
      ).length;
      
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      };
    }).reverse();

    return {
      totalGenerations,
      averageRating,
      favoriteRate,
      mostUsedProvider,
      mostUsedItemType,
      averageProcessingTime,
      recentActivity,
      providerStats,
      itemTypeStats,
      dailyActivity
    };
  }, [history, favorites]);

  const lastGeneration = history[0];

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Generation Statistics
          {stats.totalGenerations > 0 && (
            <Badge variant="secondary" className="text-xs">
              {stats.totalGenerations} total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {stats.totalGenerations === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Generate some images to see statistics</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Avg Rating</span>
                </div>
                <div className="text-lg font-semibold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </div>
                {stats.averageRating > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {'★'.repeat(Math.round(stats.averageRating))}{'☆'.repeat(5 - Math.round(stats.averageRating))}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">Favorite Rate</span>
                </div>
                <div className="text-lg font-semibold">
                  {stats.favoriteRate.toFixed(0)}%
                </div>
                <Progress value={stats.favoriteRate} className="h-1" />
              </div>
            </div>

            {stats.averageProcessingTime > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Avg Processing Time</span>
                </div>
                <div className="text-sm font-medium">
                  {(stats.averageProcessingTime / 1000).toFixed(1)}s
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium">Top Providers</span>
              </div>
              <div className="space-y-1">
                {stats.providerStats.slice(0, 3).map((stat) => (
                  <div key={stat.provider} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stat.provider}
                      </Badge>
                      {stat.avgRating > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {stat.avgRating.toFixed(1)}★
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {stat.count}
                      </span>
                      <Progress value={stat.percentage} className="w-12 h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-purple-500" />
                <span className="text-xs font-medium">Top Item Types</span>
              </div>
              <div className="space-y-1">
                {stats.itemTypeStats.slice(0, 3).map((stat) => (
                  <div key={stat.itemType} className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {stat.itemType}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {stat.count}
                      </span>
                      <Progress value={stat.percentage} className="w-12 h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {stats.recentActivity > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium">Recent Activity (7 days)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stats.recentActivity} generations</span>
                  <div className="flex gap-1">
                    {stats.dailyActivity.map((day, index) => (
                      <div
                        key={index}
                        className="w-2 bg-muted rounded-sm relative"
                        style={{ height: `${Math.max(4, day.count * 4)}px` }}
                        title={`${day.date}: ${day.count} generations`}
                      >
                        <div
                          className="w-full bg-primary rounded-sm absolute bottom-0"
                          style={{ height: `${Math.max(2, day.count * 4)}px` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {lastGeneration && (
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <div className="font-medium mb-1">Last Generation:</div>
                <div>
                  {formatDistanceToNow(new Date(lastGeneration.createdAt), { addSuffix: true })} • 
                  {lastGeneration.itemType} via {lastGeneration.provider}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};