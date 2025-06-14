
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Database, Users, Image, TrendingUp } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { formatDistanceToNow } from 'date-fns';

interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error';
  active_users: number;
  total_images: number;
  error_rate: number;
  response_time: number;
  last_backup: string;
}

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  occurred_at: string;
  resolved: boolean;
  user_id?: string;
}

export const SystemMonitor: React.FC = () => {
  const { handleError } = useErrorHandler();

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      try {
        // Get basic metrics
        const [usersResult, imagesResult, errorsResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('generated_images').select('id', { count: 'exact', head: true }),
          supabase.from('error_logs').select('id', { count: 'exact', head: true }).gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);

        const totalUsers = usersResult.count || 0;
        const totalImages = imagesResult.count || 0;
        const dailyErrors = errorsResult.count || 0;

        // Calculate error rate (errors per 1000 requests - simplified)
        const errorRate = totalImages > 0 ? (dailyErrors / totalImages) * 1000 : 0;

        return {
          database_status: errorRate < 5 ? 'healthy' : errorRate < 20 ? 'warning' : 'error',
          active_users: Math.floor(totalUsers * 0.1), // Simplified active users calculation
          total_images: totalImages,
          error_rate: errorRate,
          response_time: Math.random() * 200 + 100, // Simulated response time
          last_backup: new Date().toISOString()
        };
      } catch (error) {
        handleError(error, 'fetching system health');
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentErrors, isLoading: errorsLoading } = useQuery({
    queryKey: ['recent-errors'],
    queryFn: async (): Promise<ErrorLog[]> => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingState isLoading={healthLoading} error={null}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {health && getHealthBadge(health.database_status)}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health?.active_users || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health?.total_images || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health?.error_rate.toFixed(2) || 0}/1k</div>
            </CardContent>
          </Card>
        </LoadingState>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState
            isLoading={errorsLoading}
            error={null}
            loadingMessage="Loading error logs..."
          >
            {recentErrors && recentErrors.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent errors found!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentErrors?.map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{error.error_type}</Badge>
                        {error.resolved ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Resolved</Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Open</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{error.error_message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDistanceToNow(new Date(error.occurred_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!error.resolved && (
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </LoadingState>
        </CardContent>
      </Card>
    </div>
  );
};
