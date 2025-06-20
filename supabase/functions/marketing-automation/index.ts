
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

    console.log("🚀 Starting marketing automation...");

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 1. Find users who created images but haven't been active recently
    const { data: inactiveCreators } = await supabaseClient
      .from('profiles')
      .select('id, username, images_generated_count, updated_at')
      .gt('images_generated_count', 0)
      .lt('updated_at', threeDaysAgo.toISOString())
      .limit(50);

    // 2. Find users approaching their monthly limits
    const { data: limitApproachingUsers } = await supabaseClient
      .from('profiles')
      .select('id, username, images_generated_count, monthly_image_limit')
      .gt('images_generated_count', 0);

    const approachingLimitUsers = limitApproachingUsers?.filter(user => {
      const usagePercentage = (user.images_generated_count / user.monthly_image_limit) * 100;
      return usagePercentage >= 70 && usagePercentage < 95;
    }) || [];

    // 3. Find high-value users (lots of images, high engagement)
    const { data: highValueUsers } = await supabaseClient
      .from('profiles')
      .select('id, username, images_generated_count')
      .gt('images_generated_count', 20)
      .limit(20);

    // Send re-engagement emails to inactive creators
    for (const user of inactiveCreators || []) {
      const daysSinceActivity = Math.floor(
        (new Date().getTime() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title: 'Your designs are waiting! 🎨',
          message: `It's been ${daysSinceActivity} days since your last visit. Come back and create something amazing!`,
          notification_type: 're_engagement',
          metadata: {
            automation_type: 'inactive_creator',
            days_inactive: daysSinceActivity,
            user_images: user.images_generated_count
          }
        });
    }

    // Send upgrade prompts to users approaching limits
    for (const user of approachingLimitUsers) {
      const usagePercentage = Math.round((user.images_generated_count / user.monthly_image_limit) * 100);
      
      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title: 'Almost at your limit! ⚡',
          message: `You've used ${usagePercentage}% of your monthly images. Upgrade now to keep creating without limits!`,
          notification_type: 'upgrade_prompt',
          metadata: {
            automation_type: 'limit_approaching',
            usage_percentage: usagePercentage,
            images_used: user.images_generated_count,
            limit: user.monthly_image_limit
          }
        });
    }

    // Send VIP treatment to high-value users
    for (const user of highValueUsers || []) {
      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: user.id,
          title: 'You\'re a design superstar! ⭐',
          message: `With ${user.images_generated_count} amazing designs, you're one of our top creators! Check out our new premium features.`,
          notification_type: 'vip_recognition',
          metadata: {
            automation_type: 'high_value_user',
            total_images: user.images_generated_count,
            user_tier: 'power_creator'
          }
        });
    }

    // Generate marketing insights
    const insights = {
      timestamp: new Date().toISOString(),
      campaigns: {
        re_engagement: {
          users_targeted: inactiveCreators?.length || 0,
          avg_days_inactive: inactiveCreators?.length ? 
            inactiveCreators.reduce((sum, user) => {
              const days = Math.floor((new Date().getTime() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / inactiveCreators.length : 0
        },
        upgrade_prompts: {
          users_targeted: approachingLimitUsers.length,
          avg_usage_percentage: approachingLimitUsers.length ?
            approachingLimitUsers.reduce((sum, user) => 
              sum + (user.images_generated_count / user.monthly_image_limit * 100), 0) / approachingLimitUsers.length : 0
        },
        vip_recognition: {
          users_targeted: highValueUsers?.length || 0,
          total_images_from_vips: highValueUsers?.reduce((sum, user) => sum + user.images_generated_count, 0) || 0
        }
      }
    };

    console.log(`✅ Marketing automation completed - ${(inactiveCreators?.length || 0) + approachingLimitUsers.length + (highValueUsers?.length || 0)} users contacted`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Marketing automation completed",
        insights: insights
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Marketing automation error:", error);
    return new Response(
      JSON.stringify({ error: "Marketing automation failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
