import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationTask {
  id: string;
  user_id: string;
  notification_type: string;
  priority: number;
  title: string;
  message: string;
  payload: any;
  delivery_method: string[];
  scheduled_for: string;
  status: string;
  retry_count: number;
  max_retries: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("🔔 Processing real-time notifications...");

    // Fetch pending notifications that are due for processing
    const { data: pendingNotifications, error: fetchError } = await supabaseClient
      .from("realtime_notification_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("priority", { ascending: true })
      .order("scheduled_for", { ascending: true })
      .limit(100);

    if (fetchError) {
      console.error("❌ Error fetching notifications:", fetchError);
      throw fetchError;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      console.log("ℹ️ No pending notifications to process");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No pending notifications",
          processed: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📨 Found ${pendingNotifications.length} notifications to process`);

    const processedNotifications = [];
    const failedNotifications = [];

    // Process each notification
    for (const notification of pendingNotifications as NotificationTask[]) {
      try {
        console.log(`🔄 Processing notification ${notification.id} for user ${notification.user_id}`);

        // Process different delivery methods
        const deliveryResults = [];

        for (const method of notification.delivery_method) {
          switch (method) {
            case 'in_app':
              // Insert into user_notifications table for in-app display
              const { error: inAppError } = await supabaseClient
                .from("user_notifications")
                .insert({
                  user_id: notification.user_id,
                  title: notification.title,
                  message: notification.message,
                  notification_type: notification.notification_type,
                  metadata: notification.payload
                });

              if (inAppError) {
                console.error(`❌ Failed to deliver in-app notification:`, inAppError);
                deliveryResults.push({ method: 'in_app', success: false, error: inAppError.message });
              } else {
                console.log(`✅ In-app notification delivered for user ${notification.user_id}`);
                deliveryResults.push({ method: 'in_app', success: true });
              }
              break;

            case 'push':
              // TODO: Implement push notification delivery
              console.log(`🚧 Push notification delivery not yet implemented`);
              deliveryResults.push({ method: 'push', success: false, error: 'Not implemented' });
              break;

            case 'email':
              // TODO: Implement email notification delivery
              console.log(`🚧 Email notification delivery not yet implemented`);
              deliveryResults.push({ method: 'email', success: false, error: 'Not implemented' });
              break;

            case 'sms':
              // TODO: Implement SMS notification delivery
              console.log(`🚧 SMS notification delivery not yet implemented`);
              deliveryResults.push({ method: 'sms', success: false, error: 'Not implemented' });
              break;

            default:
              console.warn(`⚠️ Unknown delivery method: ${method}`);
              deliveryResults.push({ method, success: false, error: 'Unknown method' });
          }
        }

        // Check if at least one delivery method succeeded
        const hasSuccessfulDelivery = deliveryResults.some(result => result.success);

        if (hasSuccessfulDelivery) {
          // Mark as delivered
          const { error: updateError } = await supabaseClient
            .from("realtime_notification_queue")
            .update({
              status: "delivered",
              delivered_at: new Date().toISOString()
            })
            .eq("id", notification.id);

          if (updateError) {
            console.error(`❌ Failed to update notification status:`, updateError);
          } else {
            processedNotifications.push({
              id: notification.id,
              user_id: notification.user_id,
              delivery_results: deliveryResults
            });
          }
        } else {
          // All delivery methods failed - retry if possible
          const newRetryCount = notification.retry_count + 1;
          
          if (newRetryCount <= notification.max_retries) {
            // Schedule for retry with exponential backoff
            const retryDelay = Math.pow(2, newRetryCount) * 60000; // 2^n minutes
            const nextRetry = new Date(Date.now() + retryDelay);
            
            const { error: retryError } = await supabaseClient
              .from("realtime_notification_queue")
              .update({
                retry_count: newRetryCount,
                scheduled_for: nextRetry.toISOString()
              })
              .eq("id", notification.id);

            if (retryError) {
              console.error(`❌ Failed to schedule retry:`, retryError);
            } else {
              console.log(`🔄 Scheduled retry ${newRetryCount}/${notification.max_retries} for notification ${notification.id}`);
            }
          } else {
            // Max retries reached - mark as failed
            const { error: failError } = await supabaseClient
              .from("realtime_notification_queue")
              .update({
                status: "failed"
              })
              .eq("id", notification.id);

            if (failError) {
              console.error(`❌ Failed to mark notification as failed:`, failError);
            }

            failedNotifications.push({
              id: notification.id,
              user_id: notification.user_id,
              reason: "Max retries exceeded"
            });
          }
        }

      } catch (error) {
        console.error(`💥 Error processing notification ${notification.id}:`, error);
        failedNotifications.push({
          id: notification.id,
          user_id: notification.user_id,
          reason: error.message
        });
      }
    }

    // Track processing metrics
    const { error: metricsError } = await supabaseClient
      .from("system_health_metrics")
      .insert({
        metric_name: "notification_processing",
        metric_value: processedNotifications.length,
        metric_unit: "count",
        component_name: "notifications",
        metadata: {
          total_notifications: pendingNotifications.length,
          successful: processedNotifications.length,
          failed: failedNotifications.length,
          processing_time: Date.now()
        }
      });

    if (metricsError) {
      console.error("❌ Failed to record metrics:", metricsError);
    }

    console.log(`✅ Notification processing complete: ${processedNotifications.length} successful, ${failedNotifications.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notifications processed",
        processed: processedNotifications.length,
        failed: failedNotifications.length,
        details: {
          successful: processedNotifications,
          failed: failedNotifications
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Notification processor error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Notification processing failed", 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});