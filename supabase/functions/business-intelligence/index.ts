
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.3";
import { getErrorMessage } from '../_shared/error-utils.ts';

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

    console.log("📊 Starting business intelligence analysis...");

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. User growth analysis
    const { data: userGrowth } = await supabaseClient
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // 2. Content creation trends
    const { data: contentTrends } = await supabaseClient
      .from('generated_images')
      .select('item_type, created_at, likes, views')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // 3. Feature usage analytics
    const { data: featureUsage } = await supabaseClient
      .from('feature_usage')
      .select('feature_name, feature_category, timestamp')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    // 4. Revenue insights
    const { data: revenueData } = await supabaseClient
      .from('ecommerce_events')
      .select('event_type, price, quantity, timestamp')
      .eq('event_type', 'purchase_complete')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    // 5. Performance insights
    const { data: performanceInsights } = await supabaseClient
      .from('performance_metrics')
      .select('metric_type, duration_ms, success, timestamp')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    // Analyze user growth by day
    const userGrowthByDay = userGrowth?.reduce((acc, user) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Analyze content trends
    const itemTypePopularity = contentTrends?.reduce((acc, item) => {
      acc[item.item_type] = {
        count: (acc[item.item_type]?.count || 0) + 1,
        total_likes: (acc[item.item_type]?.total_likes || 0) + (item.likes || 0),
        total_views: (acc[item.item_type]?.total_views || 0) + (item.views || 0)
      };
      return acc;
    }, {} as Record<string, any>) || {};

    // Analyze feature adoption
    const featureAdoption = featureUsage?.reduce((acc, usage) => {
      const key = `${usage.feature_category}.${usage.feature_name}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate revenue metrics
    const totalRevenue = revenueData?.reduce((sum, event) => 
      sum + (event.price || 0) * (event.quantity || 1), 0) || 0;

    const avgOrderValue = revenueData?.length ? 
      totalRevenue / revenueData.length : 0;

    // Performance analysis
    const avgLoadTime = performanceInsights?.filter(p => p.metric_type === 'page_load')
      .reduce((sum, p, _, arr) => sum + p.duration_ms / arr.length, 0) || 0;

    const errorRate = performanceInsights?.length ? 
      (performanceInsights.filter(p => !p.success).length / performanceInsights.length * 100) : 0;

    // Generate business intelligence report
    const biReport = {
      report_date: today.toISOString(),
      period: {
        start: thirtyDaysAgo.toISOString(),
        end: today.toISOString()
      },
      user_metrics: {
        new_users: userGrowth?.length || 0,
        growth_by_day: userGrowthByDay,
        avg_daily_signups: Object.values(userGrowthByDay).length ? 
          Object.values(userGrowthByDay).reduce((a, b) => a + b, 0) / Object.values(userGrowthByDay).length : 0
      },
      content_metrics: {
        total_content_created: contentTrends?.length || 0,
        item_type_breakdown: itemTypePopularity,
        avg_engagement_rate: contentTrends?.length ? 
          contentTrends.reduce((sum, item) => sum + (item.likes || 0), 0) / contentTrends.length : 0
      },
      feature_adoption: {
        most_used_features: Object.entries(featureAdoption)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([feature, count]) => ({ feature, usage_count: count })),
        total_feature_interactions: Object.values(featureAdoption).reduce((a, b) => a + b, 0)
      },
      revenue_metrics: {
        total_revenue: totalRevenue,
        total_orders: revenueData?.length || 0,
        average_order_value: avgOrderValue,
        revenue_per_day: totalRevenue / 30
      },
      performance_metrics: {
        average_load_time_ms: Math.round(avgLoadTime),
        error_rate_percentage: Math.round(errorRate * 100) / 100,
        total_performance_events: performanceInsights?.length || 0
      },
      recommendations: generateRecommendations({
        userGrowth: userGrowth?.length || 0,
        contentCreated: contentTrends?.length || 0,
        revenue: totalRevenue,
        errorRate: errorRate
      })
    };

    // Store BI report
    const { error: insertError } = await supabaseClient
      .from('generated_contents')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        content_type: 'business_intelligence_report',
        content_data: biReport
      });

    if (insertError) {
      console.error("Error storing BI report:", insertError);
    }

    console.log("✅ Business intelligence analysis completed");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Business intelligence analysis completed",
        report: biReport
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Business intelligence error:", error);
    return new Response(
      JSON.stringify({ error: "BI analysis failed", details: getErrorMessage(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function generateRecommendations(metrics: any) {
  const recommendations = [];

  if (metrics.userGrowth < 10) {
    recommendations.push({
      category: "User Growth",
      priority: "High",
      suggestion: "Implement referral program and improve onboarding flow"
    });
  }

  if (metrics.contentCreated < 50) {
    recommendations.push({
      category: "Content Engagement",
      priority: "Medium",
      suggestion: "Add content creation incentives and tutorials"
    });
  }

  if (metrics.revenue < 100) {
    recommendations.push({
      category: "Revenue",
      priority: "High",
      suggestion: "Review pricing strategy and add premium features"
    });
  }

  if (metrics.errorRate > 5) {
    recommendations.push({
      category: "Performance",
      priority: "Critical",
      suggestion: "Investigate and fix performance issues immediately"
    });
  }

  return recommendations;
}
