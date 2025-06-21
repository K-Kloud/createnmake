
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MARKETING-INTEGRATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Marketing integration started");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, platform, data } = await req.json();
    logStep("Processing marketing action", { action, platform });

    switch (action) {
      case 'sync_email_campaigns':
        return await syncEmailCampaigns(supabase, platform, data);
      
      case 'update_customer_segments':
        return await updateCustomerSegments(supabase);
      
      case 'trigger_abandoned_cart':
        return await triggerAbandonedCartCampaign(supabase);
      
      case 'sync_social_media':
        return await syncSocialMedia(supabase, platform, data);
      
      default:
        throw new Error('Invalid marketing action');
    }
  } catch (error) {
    console.error('Marketing integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function syncEmailCampaigns(supabase: any, platform: string, data: any) {
  // Get users who opted in for email marketing
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('email_marketing_consent', true);

  const campaigns = [];
  
  // Segment users for personalized campaigns
  for (const user of users || []) {
    const campaign = {
      user_id: user.id,
      email: user.email,
      campaign_type: determineOptimalCampaign(user),
      platform: platform,
      scheduled_at: new Date().toISOString()
    };

    // Log campaign in audit trail
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'email_campaign_scheduled',
        action_details: campaign
      });

    campaigns.push(campaign);
  }

  // Mock API call to email platform (Mailchimp, Sendgrid, etc.)
  const emailResponse = await mockEmailPlatformAPI(platform, campaigns);

  return new Response(
    JSON.stringify({ 
      campaigns_created: campaigns.length,
      platform_response: emailResponse 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateCustomerSegments(supabase: any) {
  // Analyze user behavior to create segments
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id, 
      email, 
      images_generated_count, 
      creator_tier,
      created_at
    `);

  const segments = {
    'high_value': [],
    'at_risk': [],
    'new_users': [],
    'power_users': []
  };

  for (const user of users || []) {
    const daysSinceJoin = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Segment logic
    if (user.images_generated_count > 100) {
      segments.power_users.push(user.id);
    } else if (user.creator_tier === 'enterprise') {
      segments.high_value.push(user.id);
    } else if (daysSinceJoin < 7) {
      segments.new_users.push(user.id);
    } else if (user.images_generated_count === 0 && daysSinceJoin > 30) {
      segments.at_risk.push(user.id);
    }
  }

  // Store segments
  await supabase
    .from('audit_logs')
    .insert({
      action: 'customer_segments_updated',
      action_details: {
        segments: Object.keys(segments).map(key => ({
          segment: key,
          count: segments[key as keyof typeof segments].length
        }))
      }
    });

  return new Response(
    JSON.stringify({ segments }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerAbandonedCartCampaign(supabase: any) {
  // Find users with recent image generations but no purchases
  const { data: recentActivity } = await supabase
    .from('generated_images')
    .select('user_id, created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const abandonedUsers = [];
  
  for (const activity of recentActivity || []) {
    // Check if user has recent orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', activity.user_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!orders || orders.length === 0) {
      abandonedUsers.push(activity.user_id);
    }
  }

  // Trigger abandoned cart emails
  for (const userId of abandonedUsers) {
    await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        title: 'Complete your design!',
        message: 'You have amazing designs waiting. Complete your order now!',
        notification_type: 'marketing',
        metadata: { campaign_type: 'abandoned_cart' }
      });
  }

  return new Response(
    JSON.stringify({ 
      abandoned_cart_campaigns: abandonedUsers.length 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncSocialMedia(supabase: any, platform: string, data: any) {
  // Get popular images for social sharing
  const { data: popularImages } = await supabase
    .from('generated_images')
    .select('*')
    .order('likes', { ascending: false })
    .limit(10);

  const posts = [];
  
  for (const image of popularImages || []) {
    const post = {
      platform: platform,
      image_url: image.image_url,
      caption: `Amazing design created with our AI! ${image.prompt}`,
      hashtags: ['#AIDesign', '#CustomClothing', '#Fashion'],
      scheduled_at: new Date().toISOString()
    };

    await supabase
      .from('audit_logs')
      .insert({
        user_id: image.user_id,
        action: 'social_media_post_scheduled',
        action_details: post
      });

    posts.push(post);
  }

  return new Response(
    JSON.stringify({ 
      social_posts_scheduled: posts.length,
      platform: platform 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function determineOptimalCampaign(user: any): string {
  if (user.images_generated_count === 0) return 'onboarding';
  if (user.creator_tier === 'free') return 'upgrade_promotion';
  if (user.images_generated_count > 50) return 'power_user_features';
  return 'general_engagement';
}

async function mockEmailPlatformAPI(platform: string, campaigns: any[]) {
  // Mock response from email platform
  return {
    platform: platform,
    campaigns_sent: campaigns.length,
    status: 'success',
    campaign_ids: campaigns.map(() => Math.random().toString(36).substr(2, 9))
  };
}
