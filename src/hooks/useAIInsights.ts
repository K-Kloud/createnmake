import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIInsightConfig {
  enableAutomatedInsights?: boolean;
  enablePredictiveAnalytics?: boolean;
  enableAnomalyDetection?: boolean;
  insightThreshold?: number;
}

interface GeneratedInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  actionItems: string[];
  metadata: Record<string, any>;
}

export const useAIInsights = (config: AIInsightConfig = {}) => {
  const {
    enableAutomatedInsights = true,
    enablePredictiveAnalytics = true,
    enableAnomalyDetection = true,
    insightThreshold = 0.7
  } = config;

  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch recent analytics data for analysis
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-data-for-insights'],
    queryFn: async () => {
      const [conversions, performance, errors] = await Promise.all([
        supabase.from('conversion_events').select('*').gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('activity_metrics').select('*').gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('error_logs').select('*').gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        conversions: conversions.data || [],
        performance: performance.data || [],
        errors: errors.data || []
      };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    enabled: enableAutomatedInsights
  });

  // Generate insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async (analysisData: any) => {
      const insights = await analyzeDataAndGenerateInsights(analysisData);
      
      // Store insights in database
      const validInsights = insights.filter(insight => insight.confidence >= insightThreshold);
      
      if (validInsights.length > 0) {
        const { error } = await supabase
          .from('analytics_insights')
          .insert(
            validInsights.map(insight => ({
              insight_type: insight.type,
              title: insight.title,
              description: insight.description,
              confidence_score: insight.confidence,
              action_items: insight.actionItems,
              metadata: insight.metadata,
              time_period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              time_period_end: new Date().toISOString(),
              data_source: 'automated_analysis'
            }))
          );

        if (error) throw error;
      }

      return validInsights;
    },
    onSuccess: (insights) => {
      queryClient.invalidateQueries({ queryKey: ['analytics-insights'] });
      
      if (insights.length > 0) {
        toast.success(`Generated ${insights.length} new insights`);
      }
    },
    onError: (error) => {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    }
  });

  // Analyze data and generate insights
  const analyzeDataAndGenerateInsights = useCallback(async (data: any): Promise<GeneratedInsight[]> => {
    const insights: GeneratedInsight[] = [];

    if (!data) return insights;

    // Conversion funnel analysis
    if (data.conversions?.length > 0) {
      const conversionInsights = analyzeConversionFunnel(data.conversions);
      insights.push(...conversionInsights);
    }

    // Performance analysis
    if (data.performance?.length > 0) {
      const performanceInsights = analyzePerformanceMetrics(data.performance);
      insights.push(...performanceInsights);
    }

    // Error pattern analysis
    if (data.errors?.length > 0) {
      const errorInsights = analyzeErrorPatterns(data.errors);
      insights.push(...errorInsights);
    }

    // User behavior analysis
    if (data.interactions?.length > 0) {
      const behaviorInsights = analyzeUserBehavior(data.interactions);
      insights.push(...behaviorInsights);
    }

    return insights;
  }, []);

  // Analyze conversion funnel
  const analyzeConversionFunnel = (conversions: any[]): GeneratedInsight[] => {
    const insights: GeneratedInsight[] = [];
    
    // Group by funnel and calculate conversion rates
    const funnelData = conversions.reduce((acc, event) => {
      const key = event.funnel_name;
      if (!acc[key]) {
        acc[key] = {};
      }
      if (!acc[key][event.funnel_step]) {
        acc[key][event.funnel_step] = 0;
      }
      acc[key][event.funnel_step]++;
      return acc;
    }, {});

    Object.entries(funnelData).forEach(([funnelName, steps]: [string, any]) => {
      const stepNames = Object.keys(steps);
      const stepCounts = Object.values(steps) as number[];
      
      // Find the biggest drop-off
      let maxDropoff = 0;
      let dropoffStep = '';
      
      for (let i = 1; i < stepCounts.length; i++) {
        const dropoff = (stepCounts[i-1] - stepCounts[i]) / stepCounts[i-1];
        if (dropoff > maxDropoff) {
          maxDropoff = dropoff;
          dropoffStep = stepNames[i];
        }
      }

      if (maxDropoff > 0.3) { // 30% drop-off threshold
        insights.push({
          type: 'recommendation',
          title: `High Drop-off in ${funnelName} Funnel`,
          description: `${Math.round(maxDropoff * 100)}% of users are dropping off at the "${dropoffStep}" step`,
          confidence: 0.85,
          actionItems: [
            `Investigate user experience issues at the "${dropoffStep}" step`,
            'Consider A/B testing different approaches for this step',
            'Add user feedback collection at this point'
          ],
          metadata: { funnelName, dropoffStep, dropoffRate: maxDropoff }
        });
      }
    });

    return insights;
  };

  // Analyze performance metrics
  const analyzePerformanceMetrics = (metrics: any[]): GeneratedInsight[] => {
    const insights: GeneratedInsight[] = [];
    
    // Calculate average response times
    const avgResponseTime = metrics.reduce((sum, m) => sum + (m.metric_value || 0), 0) / metrics.length;
    
    if (avgResponseTime > 1000) { // Over 1 second
      insights.push({
        type: 'anomaly',
        title: 'Slow API Response Times',
        description: `Average response time is ${Math.round(avgResponseTime)}ms, which is above the recommended threshold`,
        confidence: 0.9,
        actionItems: [
          'Optimize database queries',
          'Implement caching strategies',
          'Consider scaling infrastructure'
        ],
        metadata: { averageResponseTime: avgResponseTime }
      });
    }

    // Detect response time trends
    const recentMetrics = metrics.slice(-50); // Last 50 data points
    const earlierMetrics = metrics.slice(-100, -50); // Previous 50 data points
    
    if (recentMetrics.length > 0 && earlierMetrics.length > 0) {
      const recentAvg = recentMetrics.reduce((sum, m) => sum + (m.metric_value || 0), 0) / recentMetrics.length;
      const earlierAvg = earlierMetrics.reduce((sum, m) => sum + (m.metric_value || 0), 0) / earlierMetrics.length;
      
      const trend = (recentAvg - earlierAvg) / earlierAvg;
      
      if (trend > 0.2) { // 20% increase
        insights.push({
          type: 'trend',
          title: 'Performance Degradation Detected',
          description: `Response times have increased by ${Math.round(trend * 100)}% recently`,
          confidence: 0.8,
          actionItems: [
            'Review recent deployments for performance impact',
            'Monitor resource utilization',
            'Consider rolling back recent changes if necessary'
          ],
          metadata: { trend, recentAvg, earlierAvg }
        });
      }
    }

    return insights;
  };

  // Analyze error patterns
  const analyzeErrorPatterns = (errors: any[]): GeneratedInsight[] => {
    const insights: GeneratedInsight[] = [];
    
    // Group errors by type
    const errorTypes = errors.reduce((acc, error) => {
      const type = error.error_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Find most common error type
    const mostCommonError = Object.entries(errorTypes).reduce((max, [type, count]: [string, any]) => 
      count > max.count ? { type, count } : max, { type: '', count: 0 });

    if (mostCommonError.count > 10) {
      insights.push({
        type: 'anomaly',
        title: `High Frequency of ${mostCommonError.type} Errors`,
        description: `${mostCommonError.count} occurrences of "${mostCommonError.type}" errors in the last 7 days`,
        confidence: 0.95,
        actionItems: [
          `Investigate root cause of ${mostCommonError.type} errors`,
          'Implement better error handling',
          'Add monitoring alerts for this error type'
        ],
        metadata: { errorType: mostCommonError.type, count: mostCommonError.count }
      });
    }

    return insights;
  };

  // Analyze user behavior
  const analyzeUserBehavior = (interactions: any[]): GeneratedInsight[] => {
    const insights: GeneratedInsight[] = [];
    
    // For now, just return empty insights since we removed the interactions table
    // This can be expanded later when we have proper user interaction tracking
    
    return insights;
  };

  // Auto-generate insights when data changes
  useEffect(() => {
    if (enableAutomatedInsights && analyticsData && !isProcessing) {
      setIsProcessing(true);
      generateInsightsMutation.mutate(analyticsData);
      setIsProcessing(false);
    }
  }, [analyticsData, enableAutomatedInsights]);

  // Manual insight generation
  const generateInsights = useCallback(() => {
    if (analyticsData) {
      generateInsightsMutation.mutate(analyticsData);
    }
  }, [analyticsData, generateInsightsMutation]);

  return {
    generateInsights,
    isGenerating: generateInsightsMutation.isPending || isProcessing,
    error: generateInsightsMutation.error
  };
};