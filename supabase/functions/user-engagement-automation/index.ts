
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

    console.log("🤖 Starting user engagement automation...");

    // 1. Find inactive users (no activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: inactiveUsers } = await supabaseClient
      .from('profiles')
      .select('id, username, created_at')
      .lt('updated_at', sevenDaysAgo.toISOString())
      .limit(50);

    // 2. Send re-engagement notifications
    for (const user of inactiveUsers || []) {
      const daysSinceJoined = Math.floor(
        (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      let message = "We miss you! Come back and create something amazing.";
      if (daysSinceJoined < 7) {
        message = "Ready to create your next masterpiece? Let's get started!";
      } else if (daysSinceJoined > 30) {
        message = "It's been a while! Check out our latest features and create something new.";
      }

      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title: 'Come back and create! 🎨',
          message,
          notification_type: 're_engagement',
          metadata: {
            automation_type: 'inactive_user',
            days_inactive: daysSinceJoined
          }
        });
    }

    // 3. Send creation reminders to users who haven't generated images recently
    const { data: usersToRemind } = await supabaseClient
      .from('profiles')
      .select('id, username, images_generated_count')
      .eq('images_generated_count', 0)
      .gte('created_at', sevenDaysAgo.toISOString());

    for (const user of usersToRemind || []) {
      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title: 'Ready to create your first design? ✨',
          message: 'Transform your ideas into reality with our AI-powered design tools. Start creating now!',
          notification_type: 'make_reminder',
          metadata: {
            automation_type: 'first_creation_reminder',
            user_status: 'new_user'
          }
        });
    }

    // 4. Celebrate power users (generated 10+ images in last 7 days)
    const { data: powerUsers } = await supabaseClient
      .from('generated_images')
      .select('user_id, count(*)')
      .gte('created_at', sevenDaysAgo.toISOString())
      .group('user_id')
      .having('count(*) >= 10');

    for (const user of powerUsers || []) {
      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: user.user_id,
          title: 'You\'re on fire! 🔥',
          message: 'Amazing creativity this week! Keep up the fantastic work!',
          notification_type: 'creator_activity',
          metadata: {
            automation_type: 'power_user_celebration',
            weekly_creations: user.count
          }
        });
    }

    console.log(`✅ Engagement automation completed - Reminded ${inactiveUsers?.length || 0} inactive users, ${usersToRemind?.length || 0} new users, celebrated ${powerUsers?.length || 0} power users`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User engagement automation completed",
        stats: {
          inactive_users_contacted: inactiveUsers?.length || 0,
          new_users_reminded: usersToRemind?.length || 0,
          power_users_celebrated: powerUsers?.length || 0
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Engagement automation error:", error);
    return new Response(
      JSON.stringify({ error: "Engagement automation failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
