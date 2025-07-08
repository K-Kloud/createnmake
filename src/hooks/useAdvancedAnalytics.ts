import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface HeatmapData {
  id: string;
  page_path: string;
  element_selector: string;
  interaction_type: string;
  x_coordinate: number;
  y_coordinate: number;
  viewport_width: number;
  viewport_height: number;
  timestamp: string;
}

interface AnalyticsInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  confidence_score: number;
  action_items: string[];
  data_source: string;
  time_period_start: string;
  time_period_end: string;
  is_acknowledged: boolean;
}

interface FunnelStep {
  id: string;
  funnel_name: string;
  step_name: string;
  step_order: number;
  step_criteria: any;
  is_active: boolean;
}

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Track heatmap interaction
  const trackHeatmapInteraction = useMutation({
    mutationFn: async (interaction: {
      page_path: string;
      element_selector: string;
      interaction_type: string;
      x_coordinate: number;
      y_coordinate: number;
      viewport_width: number;
      viewport_height: number;
    }) => {
      const sessionId = sessionStorage.getItem('analytics_session_id') || 'anonymous';
      
      const { error } = await supabase
        .from('heatmap_data')
        .insert({
          user_id: user?.id || null,
          session_id: sessionId,
          ...interaction,
        });

      if (error) throw error;
    },
  });

  // Get heatmap data for a page
  const useHeatmapData = (pagePath: string, timeRange: string = '7d') => {
    return useQuery({
      queryKey: ['heatmap-data', pagePath, timeRange],
      queryFn: async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));

        const { data, error } = await supabase
          .from('heatmap_data')
          .select('*')
          .eq('page_path', pagePath)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: false });

        if (error) throw error;
        return data as HeatmapData[];
      },
      enabled: !!pagePath,
    });
  };

  // Get analytics insights
  const useAnalyticsInsights = () => {
    return useQuery({
      queryKey: ['analytics-insights'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('analytics_insights')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data as AnalyticsInsight[];
      },
    });
  };

  // Get funnel analysis
  const useFunnelAnalysis = (funnelName: string) => {
    return useQuery({
      queryKey: ['funnel-analysis', funnelName],
      queryFn: async () => {
        const { data: steps, error: stepsError } = await supabase
          .from('funnel_steps')
          .select('*')
          .eq('funnel_name', funnelName)
          .eq('is_active', true)
          .order('step_order');

        if (stepsError) throw stepsError;

        const { data: stats, error: statsError } = await supabase
          .rpc('get_conversion_funnel_stats', { funnel_name_param: funnelName });

        if (statsError) throw statsError;

        return {
          steps: steps as FunnelStep[],
          stats: stats || [],
        };
      },
      enabled: !!funnelName,
    });
  };

  // A/B test management
  const createABTest = useMutation({
    mutationFn: async (test: {
      test_name: string;
      variants: string[];
      criteria: any;
    }) => {
      // This would typically involve creating test configuration
      // For now, we'll just track the test creation event
      const sessionId = sessionStorage.getItem('analytics_session_id') || 'anonymous';
      
      const { error } = await supabase
        .from('ab_test_events')
        .insert({
          user_id: user?.id || null,
          session_id: sessionId,
          test_name: test.test_name,
          variant: test.variants[0],
          event_type: 'test_created',
          metadata: test,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });

  const trackABTestEvent = useMutation({
    mutationFn: async (event: {
      test_name: string;
      variant: string;
      event_type: string;
      metadata?: any;
    }) => {
      const sessionId = sessionStorage.getItem('analytics_session_id') || 'anonymous';
      
      const { error } = await supabase
        .from('ab_test_events')
        .insert({
          user_id: user?.id || null,
          session_id: sessionId,
          ...event,
        });

      if (error) throw error;
    },
  });

  return {
    trackHeatmapInteraction,
    useHeatmapData,
    useAnalyticsInsights,
    useFunnelAnalysis,
    createABTest,
    trackABTestEvent,
  };
};