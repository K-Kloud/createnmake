
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

    console.log("🔧 Starting daily maintenance tasks...");

    // 1. Clean up expired API keys
    const { error: apiKeyError } = await supabaseClient.rpc('cleanup_expired_api_keys');
    if (apiKeyError) {
      console.error("Error cleaning up API keys:", apiKeyError);
    } else {
      console.log("✅ API keys cleanup completed");
    }

    // 2. Clean up old notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error: notificationError } = await supabaseClient
      .from('user_notifications')
      .update({ deleted_at: new Date().toISOString() })
      .lt('created_at', thirtyDaysAgo.toISOString())
      .is('deleted_at', null);

    if (notificationError) {
      console.error("Error cleaning up notifications:", notificationError);
    } else {
      console.log("✅ Old notifications cleanup completed");
    }

    // 3. Update user activity metrics
    const { error: metricsError } = await supabaseClient
      .from('activity_metrics')
      .insert({
        metric_type: 'daily_maintenance',
        metric_value: 1,
        recorded_at: new Date().toISOString()
      });

    if (metricsError) {
      console.error("Error logging maintenance metrics:", metricsError);
    } else {
      console.log("✅ Maintenance metrics logged");
    }

    // 4. Generate daily system health report
    const { data: systemStats } = await supabaseClient
      .from('generated_images')
      .select('count(*)', { count: 'exact' })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { data: activeUsers } = await supabaseClient
      .from('activity_metrics')
      .select('user_id', { count: 'exact' })
      .gte('recorded_at', new Date().toISOString().split('T')[0]);

    console.log(`📊 Daily stats - Images: ${systemStats?.length || 0}, Active users: ${activeUsers?.length || 0}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily maintenance completed successfully",
        stats: {
          images_today: systemStats?.length || 0,
          active_users_today: activeUsers?.length || 0,
          maintenance_time: new Date().toISOString()
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Daily maintenance error:", error);
    return new Response(
      JSON.stringify({ error: "Maintenance failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
