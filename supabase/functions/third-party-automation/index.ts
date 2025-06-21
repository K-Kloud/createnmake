
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[THIRD-PARTY-AUTOMATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Third-party automation started");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, service, data } = await req.json();
    logStep("Processing third-party action", { action, service });

    switch (action) {
      case 'sync_zapier_webhooks':
        return await syncZapierWebhooks(supabase, data);
      
      case 'update_google_sheets':
        return await updateGoogleSheets(supabase, data);
      
      case 'sync_slack_notifications':
        return await syncSlackNotifications(supabase, data);
      
      case 'trigger_make_scenarios':
        return await triggerMakeScenarios(supabase, data);
      
      case 'sync_discord_webhooks':
        return await syncDiscordWebhooks(supabase, data);
      
      default:
        throw new Error('Invalid third-party action');
    }
  } catch (error) {
    console.error('Third-party automation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function syncZapierWebhooks(supabase: any, data: any) {
  // Get recent user activities for Zapier sync
  const { data: recentActivity } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(50);

  const webhookPayloads = [];
  
  for (const activity of recentActivity || []) {
    const payload = {
      event_type: activity.action,
      user_id: activity.user_id,
      timestamp: activity.created_at,
      details: activity.action_details,
      source: 'openteknologies'
    };

    // Mock Zapier webhook call
    try {
      await triggerZapierWebhook(payload, data.webhook_url);
      webhookPayloads.push({ ...payload, status: 'sent' });
    } catch (error) {
      webhookPayloads.push({ ...payload, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ 
      zapier_webhooks_triggered: webhookPayloads.length,
      payloads: webhookPayloads 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateGoogleSheets(supabase: any, data: any) {
  // Get user metrics for Google Sheets sync
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      images_generated_count,
      creator_tier,
      created_at
    `);

  const sheetData = users?.map(user => ({
    user_id: user.id,
    email: user.email,
    images_generated: user.images_generated_count,
    tier: user.creator_tier,
    join_date: user.created_at,
    last_updated: new Date().toISOString()
  })) || [];

  // Mock Google Sheets API call
  const updateResult = await updateGoogleSheetsData(sheetData, data.sheet_id);

  await supabase
    .from('audit_logs')
    .insert({
      action: 'google_sheets_sync',
      action_details: {
        sheet_id: data.sheet_id,
        records_updated: sheetData.length,
        sync_timestamp: new Date().toISOString()
      }
    });

  return new Response(
    JSON.stringify({ 
      google_sheets_updated: true,
      records_count: sheetData.length,
      update_result: updateResult 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncSlackNotifications(supabase: any, data: any) {
  // Get important system events for Slack notifications
  const { data: systemEvents } = await supabase
    .from('audit_logs')
    .select('*')
    .in('action', ['user_registered', 'subscription_activated', 'payment_completed'])
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

  const slackMessages = [];
  
  for (const event of systemEvents || []) {
    const message = formatSlackMessage(event);
    
    try {
      await sendSlackMessage(message, data.webhook_url);
      slackMessages.push({ ...message, status: 'sent' });
    } catch (error) {
      slackMessages.push({ ...message, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ 
      slack_messages_sent: slackMessages.length,
      messages: slackMessages 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerMakeScenarios(supabase: any, data: any) {
  // Get data for Make.com scenarios
  const { data: orderData } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const scenarioPayloads = [];
  
  for (const order of orderData || []) {
    const payload = {
      scenario_type: 'order_fulfillment',
      order_id: order.id,
      customer_id: order.user_id,
      amount: order.amount,
      currency: order.currency,
      timestamp: order.created_at
    };

    try {
      await triggerMakeScenario(payload, data.webhook_url);
      scenarioPayloads.push({ ...payload, status: 'triggered' });
    } catch (error) {
      scenarioPayloads.push({ ...payload, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ 
      make_scenarios_triggered: scenarioPayloads.length,
      scenarios: scenarioPayloads 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncDiscordWebhooks(supabase: any, data: any) {
  // Get community highlights for Discord
  const { data: popularImages } = await supabase
    .from('generated_images')
    .select('*')
    .order('likes', { ascending: false })
    .limit(5);

  const discordMessages = [];
  
  for (const image of popularImages || []) {
    const embed = {
      title: "🎨 Community Highlight!",
      description: `Amazing design by our community!\n\n**Prompt:** ${image.prompt}`,
      image: { url: image.image_url },
      color: 0x00ff00,
      footer: { text: `❤️ ${image.likes} likes | 👁️ ${image.views} views` },
      timestamp: new Date().toISOString()
    };

    try {
      await sendDiscordWebhook(embed, data.webhook_url);
      discordMessages.push({ ...embed, status: 'sent' });
    } catch (error) {
      discordMessages.push({ ...embed, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ 
      discord_messages_sent: discordMessages.length,
      messages: discordMessages 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mock external API functions
async function triggerZapierWebhook(payload: any, webhookUrl: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Zapier webhook failed: ${response.statusText}`);
  }
  
  return response.json();
}

async function updateGoogleSheetsData(data: any[], sheetId: string) {
  // Mock Google Sheets API response
  return {
    spreadsheetId: sheetId,
    updatedRows: data.length,
    updatedColumns: 6,
    updatedCells: data.length * 6
  };
}

async function sendSlackMessage(message: any, webhookUrl: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  
  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.statusText}`);
  }
  
  return response.text();
}

async function triggerMakeScenario(payload: any, webhookUrl: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Make scenario failed: ${response.statusText}`);
  }
  
  return response.json();
}

async function sendDiscordWebhook(embed: any, webhookUrl: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  });
  
  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.statusText}`);
  }
  
  return response.text();
}

function formatSlackMessage(event: any) {
  const eventMessages = {
    'user_registered': `🎉 New user registered: ${event.action_details?.email || 'Unknown'}`,
    'subscription_activated': `💰 Subscription activated for user ${event.user_id}`,
    'payment_completed': `✅ Payment completed: $${event.action_details?.amount || '0'}`
  };

  return {
    text: eventMessages[event.action as keyof typeof eventMessages] || `📝 System event: ${event.action}`,
    timestamp: event.created_at,
    channel: '#general'
  };
}
