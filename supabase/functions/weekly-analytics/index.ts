
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

    console.log("🔍 Starting weekly analytics generation...");

    // Get date range for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 1. User engagement analytics
    const { data: userEngagement } = await supabaseClient
      .from('ui_interactions')
      .select('user_id, element_type, count(*)')
      .gte('timestamp', oneWeekAgo.toISOString())
      .group('user_id, element_type');

    // 2. Content performance analytics
    const { data: imagePerformance } = await supabaseClient
      .from('generated_images')
      .select('user_id, item_type, likes, views, created_at')
      .gte('created_at', oneWeekAgo.toISOString());

    // 3. E-commerce analytics
    const { data: ecommerceData } = await supabaseClient
      .from('ecommerce_events')
      .select('event_type, product_category, price, quantity, timestamp')
      .gte('timestamp', oneWeekAgo.toISOString());

    // 4. Performance metrics
    const { data: performanceData } = await supabaseClient
      .from('performance_metrics')
      .select('metric_type, duration_ms, success, timestamp')
      .gte('timestamp', oneWeekAgo.toISOString());

    // 5. Page analytics
    const { data: pageData } = await supabaseClient
      .from('page_analytics')
      .select('page_path, time_spent_seconds, timestamp')
      .gte('timestamp', oneWeekAgo.toISOString());

    // Generate analytics summary
    const analytics = {
      period: {
        start: oneWeekAgo.toISOString(),
        end: new Date().toISOString()
      },
      user_engagement: {
        total_interactions: userEngagement?.length || 0,
        unique_users: new Set(userEngagement?.map(u => u.user_id)).size || 0,
        top_interactions: userEngagement?.slice(0, 10) || []
      },
      content_performance: {
        total_images: imagePerformance?.length || 0,
        total_likes: imagePerformance?.reduce((sum, img) => sum + (img.likes || 0), 0) || 0,
        total_views: imagePerformance?.reduce((sum, img) => sum + (img.views || 0), 0) || 0,
        avg_likes_per_image: imagePerformance?.length ? 
          (imagePerformance.reduce((sum, img) => sum + (img.likes || 0), 0) / imagePerformance.length) : 0
      },
      ecommerce: {
        total_events: ecommerceData?.length || 0,
        total_revenue: ecommerceData?.reduce((sum, event) => 
          sum + (event.event_type === 'purchase_complete' ? (event.price || 0) * (event.quantity || 1) : 0), 0) || 0,
        conversion_events: ecommerceData?.filter(e => e.event_type === 'purchase_complete').length || 0
      },
      performance: {
        avg_page_load: performanceData?.filter(p => p.metric_type === 'page_load')
          .reduce((sum, p, _, arr) => sum + p.duration_ms / arr.length, 0) || 0,
        success_rate: performanceData?.length ? 
          (performanceData.filter(p => p.success).length / performanceData.length * 100) : 100
      },
      top_pages: pageData?.reduce((acc, page) => {
        acc[page.page_path] = (acc[page.page_path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };

    // Store analytics report
    const { error: insertError } = await supabaseClient
      .from('generated_contents')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user
        content_type: 'weekly_analytics_report',
        content_data: analytics
      });

    if (insertError) {
      console.error("Error storing analytics report:", insertError);
    }

    // Send analytics notifications to admins
    const { data: admins } = await supabaseClient
      .from('admin_roles')
      .select('user_id')
      .eq('role', 'admin');

    for (const admin of admins || []) {
      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: admin.user_id,
          title: 'Weekly Analytics Report Ready 📊',
          message: `New analytics report generated with ${analytics.user_engagement.total_interactions} interactions and ${analytics.content_performance.total_images} new images.`,
          notification_type: 'analytics_report',
          metadata: {
            report_period: analytics.period,
            key_metrics: {
              interactions: analytics.user_engagement.total_interactions,
              new_images: analytics.content_performance.total_images,
              revenue: analytics.ecommerce.total_revenue
            }
          }
        });
    }

    console.log("✅ Weekly analytics report generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Weekly analytics report generated",
        analytics: analytics,
        notifications_sent: admins?.length || 0
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Weekly analytics error:", error);
    return new Response(
      JSON.stringify({ error: "Analytics generation failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
