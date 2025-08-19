import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorLog {
  error_id: number;
  error_type: string;
  error_message: string;
  error_details?: any;
  occurred_at: string;
  resolved: boolean;
  user_id?: string;
}

export const useErrorLogs = (timeframe: 'hour' | 'day' | 'week' = 'hour') => {
  const getTimeframeSql = () => {
    switch (timeframe) {
      case 'hour': return 'occurred_at >= NOW() - INTERVAL \'1 hour\'';
      case 'day': return 'occurred_at >= NOW() - INTERVAL \'1 day\'';
      case 'week': return 'occurred_at >= NOW() - INTERVAL \'1 week\'';
      default: return 'occurred_at >= NOW() - INTERVAL \'1 hour\'';
    }
  };

  return useQuery({
    queryKey: ['error-logs', timeframe],
    queryFn: async (): Promise<ErrorLog[]> => {
      try {
        // Fix: Use correct column name 'error_id' instead of 'id'
        const { data, error } = await supabase
          .from('error_logs')
          .select('error_id, error_type, error_message, error_details, occurred_at, resolved, user_id')
          .filter('occurred_at', 'gte', new Date(Date.now() - (
            timeframe === 'hour' ? 3600000 :
            timeframe === 'day' ? 86400000 :
            604800000
          )).toISOString())
          .order('occurred_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching logs:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Failed to fetch error logs:', err);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry on failure to avoid spam
  });
};