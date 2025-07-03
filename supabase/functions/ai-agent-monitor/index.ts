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

    console.log("🔍 Starting AI agent health monitoring...");

    // Get all active AI agents
    const { data: agents, error: agentsError } = await supabaseClient
      .from('ai_agent')
      .select('*')
      .eq('active', true);

    if (agentsError) {
      throw new Error(`Failed to fetch agents: ${agentsError.message}`);
    }

    const healthChecks = [];

    // Check health for each agent
    for (const agent of agents || []) {
      try {
        const { data: healthData, error: healthError } = await supabaseClient
          .rpc('check_ai_agent_health', { p_agent_id: agent.agent_id });

        if (healthError) {
          console.error(`Health check failed for agent ${agent.agent_id}:`, healthError);
          continue;
        }

        healthChecks.push(healthData);

        // Process pending queue items for this agent
        await processAgentQueue(supabaseClient, agent.agent_id);

        // Record performance metrics
        await recordAgentMetrics(supabaseClient, agent.agent_id);

      } catch (error) {
        console.error(`Error monitoring agent ${agent.agent_id}:`, error);
        
        // Mark agent as unhealthy
        await supabaseClient
          .from('ai_agent_health')
          .upsert({
            agent_id: agent.agent_id,
            status: 'offline',
            error_count: 1,
            last_check_at: new Date().toISOString(),
            metadata: { error: error.message }
          });
      }
    }

    // Clean up old health records (keep last 7 days)
    await supabaseClient
      .from('ai_agent_health')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Generate alerts for unhealthy agents
    await generateHealthAlerts(supabaseClient, healthChecks);

    console.log(`✅ Monitored ${agents?.length || 0} AI agents successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "AI agent monitoring completed",
        agents_monitored: agents?.length || 0,
        health_checks: healthChecks
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("AI agent monitoring error:", error);
    return new Response(
      JSON.stringify({ error: "AI agent monitoring failed", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

async function processAgentQueue(supabaseClient: any, agentId: number) {
  // Get pending tasks for this agent
  const { data: queueItems } = await supabaseClient
    .from('ai_agent_queue')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(10);

  for (const item of queueItems || []) {
    try {
      // Mark as processing
      await supabaseClient
        .from('ai_agent_queue')
        .update({ 
          status: 'processing', 
          started_at: new Date().toISOString(),
          attempts: item.attempts + 1
        })
        .eq('id', item.id);

      // Execute the task based on type
      let result;
      switch (item.task_type) {
        case 'user_engagement':
          result = await executeUserEngagementTask(supabaseClient, item.payload);
          break;
        case 'content_generation':
          result = await executeContentGenerationTask(supabaseClient, item.payload);
          break;
        case 'analytics':
          result = await executeAnalyticsTask(supabaseClient, item.payload);
          break;
        default:
          throw new Error(`Unknown task type: ${item.task_type}`);
      }

      // Mark as completed
      await supabaseClient
        .from('ai_agent_queue')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString()
        })
        .eq('id', item.id);

      console.log(`✅ Completed task ${item.id} for agent ${agentId}`);

    } catch (error) {
      console.error(`❌ Failed task ${item.id} for agent ${agentId}:`, error);

      // Check if max attempts reached
      if (item.attempts + 1 >= item.max_attempts) {
        await supabaseClient
          .from('ai_agent_queue')
          .update({ 
            status: 'failed', 
            error_message: error.message
          })
          .eq('id', item.id);
      } else {
        // Retry later
        await supabaseClient
          .from('ai_agent_queue')
          .update({ 
            status: 'pending',
            scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry in 5 minutes
          })
          .eq('id', item.id);
      }
    }
  }
}

async function recordAgentMetrics(supabaseClient: any, agentId: number) {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Count API calls in the last hour
  const { count: apiCalls } = await supabaseClient
    .from('ai_agent_queries')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .gte('executed_at', hourAgo.toISOString());

  // Record metrics
  await supabaseClient
    .from('ai_agent_metrics')
    .insert({
      agent_id: agentId,
      metric_type: 'api_calls',
      metric_value: apiCalls || 0,
      period_start: hourAgo.toISOString(),
      period_end: now.toISOString()
    });
}

async function generateHealthAlerts(supabaseClient: any, healthChecks: any[]) {
  const unhealthyAgents = healthChecks.filter(check => 
    check.status === 'unhealthy' || check.status === 'offline'
  );

  for (const unhealthyAgent of unhealthyAgents) {
    // Create notification for admins
    const { data: admins } = await supabaseClient
      .from('admin_roles')
      .select('user_id')
      .in('role', ['admin', 'super_admin']);

    for (const admin of admins || []) {
      await supabaseClient
        .from('user_notifications')
        .insert({
          user_id: admin.user_id,
          title: 'AI Agent Health Alert',
          message: `AI Agent ${unhealthyAgent.agent_id} is ${unhealthyAgent.status}`,
          notification_type: 'system_alert',
          metadata: {
            agent_id: unhealthyAgent.agent_id,
            status: unhealthyAgent.status,
            success_rate: unhealthyAgent.success_rate
          }
        });
    }
  }
}

async function executeUserEngagementTask(supabaseClient: any, payload: any) {
  // Execute user engagement automation
  const { data, error } = await supabaseClient.functions.invoke('user-engagement-automation', {
    body: payload
  });
  
  if (error) throw error;
  return data;
}

async function executeContentGenerationTask(supabaseClient: any, payload: any) {
  // Execute AI content generation
  const { data, error } = await supabaseClient.functions.invoke('ai-content-generation', {
    body: payload
  });
  
  if (error) throw error;
  return data;
}

async function executeAnalyticsTask(supabaseClient: any, payload: any) {
  // Execute analytics task
  const { data, error } = await supabaseClient.functions.invoke('weekly-analytics', {
    body: payload
  });
  
  if (error) throw error;
  return data;
}
