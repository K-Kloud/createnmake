import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Activity, 
  Zap,
  HardDrive,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  hit_rate: number;
  miss_rate: number;
  total_requests: number;
  cache_size: number;
  memory_usage: number;
  entries_count: number;
}

interface CacheEntry {
  key: string;
  size: number;
  hit_count: number;
  last_accessed: string;
  expires_at?: string;
  type: 'api' | 'image' | 'data' | 'page';
}

export const CacheManager: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCacheData();
    const interval = setInterval(loadCacheData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCacheData = async () => {
    try {
      // Simulate cache data - in real app, this would come from your cache service
      const mockStats: CacheStats = {
        hit_rate: 85.6,
        miss_rate: 14.4,
        total_requests: 45230,
        cache_size: 256.7, // MB
        memory_usage: 68.3, // Percentage
        entries_count: 1247
      };

      const mockEntries: CacheEntry[] = [
        {
          key: 'api:user:profile:12345',
          size: 2.4,
          hit_count: 156,
          last_accessed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          type: 'api'
        },
        {
          key: 'image:generated:67890',
          size: 1.8,
          hit_count: 89,
          last_accessed: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          type: 'image'
        },
        {
          key: 'data:analytics:daily',
          size: 5.2,
          hit_count: 234,
          last_accessed: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          type: 'data'
        },
        {
          key: 'page:homepage:component',
          size: 12.1,
          hit_count: 445,
          last_accessed: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          type: 'page'
        }
      ];

      setStats(mockStats);
      setEntries(mockEntries);
    } catch (error) {
      console.error('Error loading cache data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async (type?: string) => {
    setIsClearing(true);
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (type) {
        setEntries(prev => prev.filter(entry => entry.type !== type));
        toast({
          title: 'Cache Cleared',
          description: `${type} cache has been cleared successfully`
        });
      } else {
        setEntries([]);
        toast({
          title: 'All Cache Cleared',
          description: 'All cache entries have been cleared successfully'
        });
      }
      
      await loadCacheData();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cache',
        variant: 'destructive'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api': return 'bg-blue-500';
      case 'image': return 'bg-green-500';
      case 'data': return 'bg-yellow-500';
      case 'page': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatSize = (sizeKB: number) => {
    if (sizeKB < 1024) return `${sizeKB.toFixed(1)} KB`;
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Loading cache data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cache Manager</h2>
          <p className="text-muted-foreground">Monitor and manage application cache performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadCacheData()} disabled={isClearing}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => clearCache()}
            disabled={isClearing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.hit_rate.toFixed(1)}%</div>
            <Progress value={stats?.hit_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.memory_usage.toFixed(1)}%</div>
            <Progress value={stats?.memory_usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.cache_size.toFixed(1)} MB used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Database className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.entries_count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_requests.toLocaleString()} total requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['api', 'image', 'data', 'page'] as const).map(type => {
          const typeEntries = entries.filter(e => e.type === type);
          const typeSize = typeEntries.reduce((sum, e) => sum + e.size, 0);
          
          return (
            <Card key={type}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium capitalize">{type} Cache</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xl font-bold">{typeEntries.length} entries</div>
                  <div className="text-sm text-muted-foreground">
                    {formatSize(typeSize * 1024)} total
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => clearCache(type)}
                    disabled={isClearing || typeEntries.length === 0}
                    className="w-full"
                  >
                    Clear {type}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cache Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cache Entries</CardTitle>
          <CardDescription>Most frequently accessed cache entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.slice(0, 10).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getTypeColor(entry.type)}`} />
                  <div>
                    <div className="font-medium text-sm">{entry.key}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.hit_count} hits • {formatSize(entry.size * 1024)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {entry.type}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatTimeAgo(entry.last_accessed)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};