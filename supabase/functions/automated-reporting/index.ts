
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("📈 Starting automated reporting system...");

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. Daily system health report
    const { data: systemHealth } = await supabaseClient
      .from('performance_metrics')
      .select('metric_type, duration_ms, success, timestamp')
      .gte('timestamp', yesterday.toISOString())
      .lt('timestamp', today.toISOString());

    // 2. Daily user activity report
    const { data: userActivity } = await supabaseClient
      .from('ui_interactions')
      .select('user_id, element_type, timestamp')
      .gte('timestamp', yesterday.toISOString())
      .lt('timestamp', today.toISOString());

    // 3. Daily content creation report
    const { data: contentCreation } = await supabaseClient
      .from('generated_images')
      .select('user_id, item_type, likes, views, created_at')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());

    // 4. Daily error monitoring
    const { data: errors } = await supabaseClient
      .from('error_logs')
      .select('error_type, error_message, occurred_at, resolved')
      .gte('occurred_at', yesterday.toISOString())
      .lt('occurred_at', today.toISOString());

    // 5. Revenue and conversion tracking
    const { data: conversions } = await supabaseClient
      .from('conversion_events')
      .select('funnel_name, funnel_step, completed, timestamp')
      .gte('timestamp', yesterday.toISOString())
      .lt('timestamp', today.toISOString());

    // Calculate metrics
    const systemHealthMetrics = {
      total_requests: systemHealth?.length || 0,
      avg_response_time: systemHealth?.length ? 
        systemHealth.reduce((sum, h) => sum + h.duration_ms, 0) / systemHealth.length : 0,
      success_rate: systemHealth?.length ? 
        (systemHealth.filter(h => h.success).length / systemHealth.length * 100) : 100,
      errors_count: systemHealth?.filter(h => !h.success).length || 0
    };

    const userActivityMetrics = {
      active_users: new Set(userActivity?.map(a => a.user_id)).size || 0,
      total_interactions: userActivity?.length || 0,
      top_actions: userActivity?.reduce((acc, action) => {
        acc[action.element_type] = (acc[action.element_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };

    const contentMetrics = {
      images_created: contentCreation?.length || 0,
      total_engagement: contentCreation?.reduce((sum, img) => sum + (img.likes || 0) + (img.views || 0), 0) || 0,
      popular_types: contentCreation?.reduce((acc, img) => {
        acc[img.item_type] = (acc[img.item_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };

    const errorMetrics = {
      total_errors: errors?.length || 0,
      unresolved_errors: errors?.filter(e => !e.resolved).length || 0,
      error_types: errors?.reduce((acc, err) => {
        acc[err.error_type] = (acc[err.error_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };

    const conversionMetrics = {
      total_conversions: conversions?.filter(c => c.completed).length || 0,
      conversion_funnels: conversions?.reduce((acc, conv) => {
        if (!acc[conv.funnel_name]) {
          acc[conv.funnel_name] = { total: 0, completed: 0 };
        }
        acc[conv.funnel_name].total += 1;
        if (conv.completed) {
          acc[conv.funnel_name].completed += 1;
        }
        return acc;
      }, {} as Record<string, any>) || {}
    };

    // Generate comprehensive daily report
    const dailyReport = {
      report_date: yesterday.toISOString().split('T')[0],
      generated_at: today.toISOString(),
      system_health: systemHealthMetrics,
      user_activity: userActivityMetrics,
      content_creation: contentMetrics,
      error_monitoring: errorMetrics,
      conversions: conversionMetrics,
      alerts: generateAlerts({
        successRate: systemHealthMetrics.success_rate,
        errorCount: errorMetrics.total_errors,
        activeUsers: userActivityMetrics.active_users,
        unresolvedErrors: errorMetrics.unresolved_errors
      }),
      summary: {
        health_status: systemHealthMetrics.success_rate > 95 ? 'Excellent' : 
                      systemHealthMetrics.success_rate > 90 ? 'Good' : 
                      systemHealthMetrics.success_rate > 80 ? 'Warning' : 'Critical',
        engagement_level: userActivityMetrics.active_users > 50 ? 'High' : 
                         userActivityMetrics.active_users > 20 ? 'Medium' : 'Low',
        content_activity: contentMetrics.images_created > 20 ? 'High' : 
                         contentMetrics.images_created > 10 ? 'Medium' : 'Low'
      }
    };

    // Store the daily report
    const { error: insertError } = await supabaseClient
      .from('generated_contents')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        content_type: 'daily_automated_report',
        content_data: dailyReport
      });

    if (insertError) {
      console.error("Error storing daily report:", insertError);
    }

    // Send critical alerts to admins if needed
    if (dailyReport.alerts.length > 0) {
      const { data: admins } = await supabaseClient
        .from('admin_roles')
        .select('user_id')
        .in('role', ['admin', 'super_admin']);

      for (const admin of admins || []) {
        await supabaseClient
          .from('user_notifications')
          .insert({
            user_id: admin.user_id,
            title: '🚨 System Alert - Daily Report',
            message: `${dailyReport.alerts.length} alerts detected in today's automated report. Please review immediately.`,
            notification_type: 'system_alert',
            metadata: {
              alerts: dailyReport.alerts,
              report_date: dailyReport.report_date,
              health_status: dailyReport.summary.health_status
            }
          });
      }
    }

    console.log(`✅ Daily automated report generated with ${dailyReport.alerts.length} alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily automated report generated",
        report: dailyReport,
        alerts_sent: dailyReport.alerts.length > 0
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Automated reporting error:", error);
    return new Response(
      JSON.stringify({ error: "Automated reporting failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function generateAlerts(metrics: any) {
  const alerts = [];

  if (metrics.successRate < 95) {
    alerts.push({
      type: 'performance',
      severity: metrics.successRate < 90 ? 'critical' : 'warning',
      message: `System success rate is ${metrics.successRate.toFixed(1)}%`,
      action_required: 'Investigate performance issues'
    });
  }

  if (metrics.unresolvedErrors > 5) {
    alerts.push({
      type: 'errors',
      severity: 'high',
      message: `${metrics.unresolvedErrors} unresolved errors detected`,
      action_required: 'Review and resolve pending errors'
    });
  }

  if (metrics.activeUsers < 10) {
    alerts.push({
      type: 'engagement',
      severity: 'medium',
      message: `Low user activity: only ${metrics.activeUsers} active users yesterday`,
      action_required: 'Review engagement strategies'
    });
  }

  return alerts;
}
