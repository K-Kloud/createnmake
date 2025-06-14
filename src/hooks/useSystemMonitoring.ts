
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  response_time: number;
  error_rate: number;
  timestamp: string;
}

interface AlertRule {
  id: string;
  metric_type: string;
  threshold: number;
  comparison: 'greater_than' | 'less_than' | 'equals';
  enabled: boolean;
  notification_channels: string[];
}

export const useSystemMonitoring = () => {
  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current system metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async (): Promise<SystemMetrics> => {
      try {
        // In a real implementation, this would call a monitoring service
        // For now, we'll simulate metrics
        const [dbHealth, userCount, errorCount] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('error_logs').select('id', { count: 'exact', head: true })
            .gte('occurred_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        ]);

        const totalUsers = userCount.count || 0;
        const hourlyErrors = errorCount.count || 0;

        return {
          cpu_usage: Math.random() * 30 + 20, // 20-50%
          memory_usage: Math.random() * 40 + 30, // 30-70%
          disk_usage: Math.random() * 20 + 40, // 40-60%
          active_connections: totalUsers,
          response_time: Math.random() * 100 + 50, // 50-150ms
          error_rate: totalUsers > 0 ? (hourlyErrors / totalUsers) * 100 : 0,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        handleError(error, 'fetching system metrics');
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get alert rules
  const { data: alertRules, isLoading: alertsLoading } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: async (): Promise<AlertRule[]> => {
      // In a real implementation, this would fetch from a monitoring configuration table
      return [
        {
          id: '1',
          metric_type: 'cpu_usage',
          threshold: 80,
          comparison: 'greater_than',
          enabled: true,
          notification_channels: ['email', 'slack']
        },
        {
          id: '2',
          metric_type: 'memory_usage',
          threshold: 85,
          comparison: 'greater_than',
          enabled: true,
          notification_channels: ['email']
        },
        {
          id: '3',
          metric_type: 'error_rate',
          threshold: 5,
          comparison: 'greater_than',
          enabled: true,
          notification_channels: ['email', 'slack', 'sms']
        }
      ];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Record system metrics
  const recordMetrics = useMutation({
    mutationFn: async (metrics: Partial<SystemMetrics>) => {
      const { error } = await supabase
        .from('activity_metrics')
        .insert({
          metric_type: 'system_health',
          metric_value: metrics.cpu_usage || 0,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onError: (error) => {
      handleError(error, 'recording system metrics');
    }
  });

  // Trigger alert
  const triggerAlert = useMutation({
    mutationFn: async ({ 
      metric_type, 
      current_value, 
      threshold, 
      message 
    }: { 
      metric_type: string; 
      current_value: number; 
      threshold: number; 
      message: string; 
    }) => {
      // Log the alert
      const { error } = await supabase
        .from('error_logs')
        .insert({
          error_type: 'system_alert',
          error_message: message,
          error_details: {
            metric_type,
            current_value,
            threshold,
            alert_level: current_value > threshold * 1.5 ? 'critical' : 'warning'
          }
        });

      if (error) throw error;

      // Show toast notification
      toast({
        title: 'System Alert',
        description: message,
        variant: current_value > threshold * 1.5 ? 'destructive' : 'default'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-errors'] });
    }
  });

  // Check for alerts based on current metrics
  React.useEffect(() => {
    if (metrics && alertRules) {
      alertRules.forEach(rule => {
        if (!rule.enabled) return;

        const currentValue = metrics[rule.metric_type as keyof SystemMetrics] as number;
        if (typeof currentValue !== 'number') return;

        let shouldAlert = false;
        switch (rule.comparison) {
          case 'greater_than':
            shouldAlert = currentValue > rule.threshold;
            break;
          case 'less_than':
            shouldAlert = currentValue < rule.threshold;
            break;
          case 'equals':
            shouldAlert = Math.abs(currentValue - rule.threshold) < 0.1;
            break;
        }

        if (shouldAlert) {
          triggerAlert.mutate({
            metric_type: rule.metric_type,
            current_value: currentValue,
            threshold: rule.threshold,
            message: `${rule.metric_type} is ${currentValue.toFixed(2)}% (threshold: ${rule.threshold}%)`
          });
        }
      });
    }
  }, [metrics, alertRules]);

  return {
    metrics,
    alertRules,
    isLoading: metricsLoading || alertsLoading,
    recordMetrics: recordMetrics.mutate,
    triggerAlert: triggerAlert.mutate
  };
};
