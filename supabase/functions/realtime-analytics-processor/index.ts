import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertData {
  type: string;
  data: any;
  timestamp: number;
}

interface PerformanceAlert {
  metricName: string;
  actualValue: number;
  threshold: number;
  userId?: string;
  sessionId: string;
  severity: 'warning' | 'critical';
}

interface ErrorAlert {
  errorMessage: string;
  errorType: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
}

interface SystemAlert {
  alertType: string;
  errorRate?: number;
  threshold?: number;
  timestamp: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data }: AlertData = await req.json();
    console.log(`[REALTIME-ANALYTICS] Processing alert type: ${type}`);

    switch (type) {
      case 'performance_alert':
        await handlePerformanceAlert(supabase, data as PerformanceAlert);
        break;
      case 'error_alert':
        await handleErrorAlert(supabase, data as ErrorAlert);
        break;
      case 'system_alert':
        await handleSystemAlert(supabase, data as SystemAlert);
        break;
      case 'batch_process':
        await handleBatchProcessing(supabase, data);
        break;
      default:
        console.log(`Unknown alert type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true, type, processed_at: new Date().toISOString() }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[REALTIME-ANALYTICS] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function handlePerformanceAlert(supabase: any, alertData: PerformanceAlert) {
  console.log(`[PERFORMANCE-ALERT] ${alertData.metricName}: ${alertData.actualValue}ms (threshold: ${alertData.threshold}ms)`);

  // Insert performance alert record
  const { error: insertError } = await supabase
    .from('analytics_insights')
    .insert({
      title: `Performance Alert: ${alertData.metricName}`,
      description: `${alertData.metricName} exceeded threshold of ${alertData.threshold}ms with value ${alertData.actualValue}ms`,
      insight_type: 'performance_alert',
      data_source: 'realtime_monitoring',
      time_period_start: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      time_period_end: new Date().toISOString(),
      confidence_score: alertData.severity === 'critical' ? 0.95 : 0.75,
      metadata: {
        metric_name: alertData.metricName,
        actual_value: alertData.actualValue,
        threshold: alertData.threshold,
        severity: alertData.severity,
        session_id: alertData.sessionId,
        user_id: alertData.userId
      },
      action_items: [
        {
          action: 'investigate_performance_issue',
          priority: alertData.severity,
          description: `Investigate ${alertData.metricName} performance degradation`
        },
        {
          action: 'check_server_resources',
          priority: 'medium',
          description: 'Monitor server CPU and memory usage'
        }
      ]
    });

  if (insertError) {
    console.error('[PERFORMANCE-ALERT] Insert error:', insertError);
  }

  // Trigger immediate actions for critical alerts
  if (alertData.severity === 'critical') {
    await triggerCriticalPerformanceActions(supabase, alertData);
  }
}

async function handleErrorAlert(supabase: any, alertData: ErrorAlert) {
  console.log(`[ERROR-ALERT] ${alertData.errorType}: ${alertData.errorMessage}`);

  // Insert error insight
  const { error: insertError } = await supabase
    .from('analytics_insights')
    .insert({
      title: `Error Alert: ${alertData.errorType}`,
      description: `New error occurred: ${alertData.errorMessage}`,
      insight_type: 'error_alert',
      data_source: 'error_monitoring',
      time_period_start: new Date(alertData.timestamp).toISOString(),
      time_period_end: new Date().toISOString(),
      confidence_score: 0.9,
      metadata: {
        error_type: alertData.errorType,
        error_message: alertData.errorMessage,
        session_id: alertData.sessionId,
        user_id: alertData.userId,
        timestamp: alertData.timestamp
      },
      action_items: [
        {
          action: 'investigate_error',
          priority: 'high',
          description: `Investigate ${alertData.errorType} error`
        },
        {
          action: 'check_error_patterns',
          priority: 'medium',
          description: 'Analyze error patterns and frequency'
        }
      ]
    });

  if (insertError) {
    console.error('[ERROR-ALERT] Insert error:', insertError);
  }

  // Check for error patterns
  await analyzeErrorPatterns(supabase, alertData);
}

async function handleSystemAlert(supabase: any, alertData: SystemAlert) {
  console.log(`[SYSTEM-ALERT] ${alertData.alertType}`);

  const { error: insertError } = await supabase
    .from('analytics_insights')
    .insert({
      title: `System Alert: ${alertData.alertType}`,
      description: `System-wide alert triggered: ${alertData.alertType}`,
      insight_type: 'system_alert',
      data_source: 'system_monitoring',
      time_period_start: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      time_period_end: new Date().toISOString(),
      confidence_score: 0.85,
      metadata: alertData,
      action_items: [
        {
          action: 'investigate_system_issue',
          priority: 'critical',
          description: `Investigate ${alertData.alertType} system alert`
        },
        {
          action: 'check_system_health',
          priority: 'high',
          description: 'Perform comprehensive system health check'
        }
      ]
    });

  if (insertError) {
    console.error('[SYSTEM-ALERT] Insert error:', insertError);
  }
}

async function handleBatchProcessing(supabase: any, data: any) {
  console.log('[BATCH-PROCESS] Processing batch analytics data');
  
  // Process analytics insights from accumulated data
  const insights = await generateInsights(supabase, data);
  
  for (const insight of insights) {
    const { error } = await supabase
      .from('analytics_insights')
      .insert(insight);
      
    if (error) {
      console.error('[BATCH-PROCESS] Error inserting insight:', error);
    }
  }
}

async function triggerCriticalPerformanceActions(supabase: any, alertData: PerformanceAlert) {
  // Log critical performance issue
  console.log(`[CRITICAL-PERFORMANCE] Taking immediate action for ${alertData.metricName}`);
  
  // You could trigger additional actions here such as:
  // - Scaling server resources
  // - Sending notifications to admin team
  // - Activating performance optimization protocols
  
  // For now, we'll just log the critical issue
  await supabase
    .from('audit_logs')
    .insert({
      action: 'critical_performance_alert',
      action_details: {
        metric: alertData.metricName,
        value: alertData.actualValue,
        threshold: alertData.threshold,
        session_id: alertData.sessionId,
        timestamp: new Date().toISOString()
      }
    });
}

async function analyzeErrorPatterns(supabase: any, alertData: ErrorAlert) {
  // Check for similar errors in the last hour
  const { data: recentErrors } = await supabase
    .from('error_logs')
    .select('*')
    .eq('error_type', alertData.errorType)
    .gte('occurred_at', new Date(Date.now() - 3600000).toISOString());

  if (recentErrors && recentErrors.length > 5) {
    // Pattern detected - create insight
    await supabase
      .from('analytics_insights')
      .insert({
        title: 'Error Pattern Detected',
        description: `Recurring ${alertData.errorType} errors detected (${recentErrors.length} occurrences in last hour)`,
        insight_type: 'error_pattern',
        data_source: 'error_analysis',
        time_period_start: new Date(Date.now() - 3600000).toISOString(),
        time_period_end: new Date().toISOString(),
        confidence_score: 0.8,
        metadata: {
          error_type: alertData.errorType,
          frequency: recentErrors.length,
          pattern_detected: true
        },
        action_items: [
          {
            action: 'fix_recurring_error',
            priority: 'critical',
            description: `Address recurring ${alertData.errorType} error pattern`
          }
        ]
      });
  }
}

async function generateInsights(supabase: any, data: any): Promise<any[]> {
  const insights = [];
  
  // Generate performance insights
  if (data.performance) {
    insights.push({
      title: 'Performance Analysis',
      description: 'Automated performance analysis from batch processing',
      insight_type: 'performance_analysis',
      data_source: 'batch_processing',
      time_period_start: new Date(Date.now() - 3600000).toISOString(),
      time_period_end: new Date().toISOString(),
      confidence_score: 0.7,
      metadata: data.performance
    });
  }
  
  return insights;
}