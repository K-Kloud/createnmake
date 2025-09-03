import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event_type: string;
  provider: string;
  user_id?: string;
  metadata: Record<string, any>;
  timestamp: string;
}

interface ProcessedMetrics {
  provider: string;
  metric_type: string;
  metric_value: number;
  recorded_at: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting real-time analytics processing...');

    // Process different types of analytics events
    const { data: recentEvents, error: eventsError } = await supabase
      .from('activity_metrics')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .order('recorded_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching recent events:', eventsError);
      throw eventsError;
    }

    console.log(`📊 Processing ${recentEvents?.length || 0} recent events`);

    // Group events by provider for processing
    const providerMetrics = new Map<string, any[]>();
    
    recentEvents?.forEach(event => {
      if (event.metric_type === 'generation_time' || event.metric_type === 'success_rate') {
        const provider = event.user_id; // Assuming user_id maps to provider context
        if (!providerMetrics.has(provider)) {
          providerMetrics.set(provider, []);
        }
        providerMetrics.get(provider)!.push(event);
      }
    });

    // Calculate real-time metrics for each provider
    const processedMetrics: ProcessedMetrics[] = [];
    
    for (const [provider, events] of providerMetrics) {
      // Calculate average generation time
      const generationTimes = events
        .filter(e => e.metric_type === 'generation_time')
        .map(e => e.metric_value);
      
      if (generationTimes.length > 0) {
        const avgTime = generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length;
        processedMetrics.push({
          provider: provider || 'unknown',
          metric_type: 'avg_generation_time_5min',
          metric_value: avgTime,
          recorded_at: new Date().toISOString(),
          metadata: { 
            sample_size: generationTimes.length,
            processing_window: '5min'
          }
        });
      }

      // Calculate success rate
      const successEvents = events.filter(e => e.metric_type === 'success_rate');
      if (successEvents.length > 0) {
        const successRate = (successEvents.filter(e => e.metric_value === 1).length / successEvents.length) * 100;
        processedMetrics.push({
          provider: provider || 'unknown',
          metric_type: 'success_rate_5min',
          metric_value: successRate,
          recorded_at: new Date().toISOString(),
          metadata: { 
            sample_size: successEvents.length,
            processing_window: '5min'
          }
        });
      }
    }

    // Store processed metrics
    if (processedMetrics.length > 0) {
      const { error: insertError } = await supabase
        .from('provider_metrics')
        .insert(processedMetrics);

      if (insertError) {
        console.error('Error inserting processed metrics:', insertError);
      } else {
        console.log(`✅ Stored ${processedMetrics.length} processed metrics`);
      }
    }

    // Check for anomalies and generate insights
    const insights = await generateInsights(processedMetrics, supabase);
    
    if (insights.length > 0) {
      console.log(`🧠 Generated ${insights.length} new insights`);
      
      const { error: insightsError } = await supabase
        .from('analytics_insights')
        .insert(insights);

      if (insightsError) {
        console.error('Error storing insights:', insightsError);
      }
    }

    // Trigger alerts if needed
    await checkAndTriggerAlerts(processedMetrics, supabase);

    const response = {
      success: true,
      processed_events: recentEvents?.length || 0,
      generated_metrics: processedMetrics.length,
      generated_insights: insights.length,
      timestamp: new Date().toISOString()
    };

    console.log('📈 Real-time processing complete:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in realtime analytics processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateInsights(metrics: ProcessedMetrics[], supabase: any) {
  const insights = [];
  
  for (const metric of metrics) {
    // Check for performance degradation
    if (metric.metric_type === 'success_rate_5min' && metric.metric_value < 80) {
      insights.push({
        insight_type: 'performance_degradation',
        title: `${metric.provider} Performance Alert`,
        description: `Success rate dropped to ${metric.metric_value.toFixed(1)}% in the last 5 minutes`,
        confidence_score: 0.9,
        data_source: 'realtime_processor',
        time_period_start: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        time_period_end: new Date().toISOString(),
        metadata: {
          provider: metric.provider,
          metric_type: metric.metric_type,
          metric_value: metric.metric_value,
          alert_threshold: 80
        },
        action_items: [
          'Check provider API status',
          'Review recent configuration changes',
          'Consider switching traffic to alternative providers'
        ],
        is_acknowledged: false
      });
    }

    // Check for slow response times
    if (metric.metric_type === 'avg_generation_time_5min' && metric.metric_value > 15) {
      insights.push({
        insight_type: 'slow_response_time',
        title: `${metric.provider} Slow Response Alert`,
        description: `Average generation time increased to ${metric.metric_value.toFixed(1)}s in the last 5 minutes`,
        confidence_score: 0.85,
        data_source: 'realtime_processor',
        time_period_start: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        time_period_end: new Date().toISOString(),
        metadata: {
          provider: metric.provider,
          metric_type: metric.metric_type,
          metric_value: metric.metric_value,
          alert_threshold: 15
        },
        action_items: [
          'Monitor provider load balancing',
          'Check network connectivity',
          'Consider scaling provider infrastructure'
        ],
        is_acknowledged: false
      });
    }
  }

  return insights;
}

async function checkAndTriggerAlerts(metrics: ProcessedMetrics[], supabase: any) {
  // Get active alert configurations
  const { data: alertConfigs } = await supabase
    .from('ai_alert_config')
    .select('*')
    .eq('is_active', true);

  if (!alertConfigs?.length) return;

  for (const config of alertConfigs) {
    for (const metric of metrics) {
      const shouldAlert = evaluateAlertCondition(metric, config);
      
      if (shouldAlert) {
        console.log(`🚨 Triggering alert: ${config.alert_type} for ${metric.provider}`);
        
        // Here you could implement actual alerting (email, Slack, etc.)
        // For now, we'll just log it
        await supabase
          .from('audit_logs')
          .insert({
            action: 'realtime_alert_triggered',
            action_details: {
              alert_config_id: config.id,
              metric: metric,
              alert_type: config.alert_type,
              threshold_value: config.threshold_value,
              actual_value: metric.metric_value
            }
          });
      }
    }
  }
}

function evaluateAlertCondition(metric: ProcessedMetrics, config: any): boolean {
  const value = metric.metric_value;
  const threshold = config.threshold_value;
  
  switch (config.threshold_operator) {
    case 'greater_than':
      return value > threshold;
    case 'less_than':
      return value < threshold;
    case 'equals':
      return Math.abs(value - threshold) < 0.01;
    case 'greater_than_or_equal':
      return value >= threshold;
    case 'less_than_or_equal':
      return value <= threshold;
    default:
      return false;
  }
}