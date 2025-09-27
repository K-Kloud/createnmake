import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIAgent {
  agent_id: number;
  name: string;
  description?: string;
  active: boolean;
}

interface HealthCheck {
  agent_id: number;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  response_time_ms: number;
  success_rate: number;
  error_count: number;
  metadata: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🤖 Starting AI agent monitoring cycle...');

    // Get all active AI agents
    const { data: agents, error: agentsError } = await supabase
      .from('ai_agent')
      .select('*')
      .eq('active', true);

    if (agentsError) {
      console.error('Error fetching AI agents:', agentsError);
      throw agentsError;
    }

    console.log(`🔍 Monitoring ${agents?.length || 0} active AI agents`);

    const healthChecks: HealthCheck[] = [];

    // Monitor each active agent
    for (const agent of agents || []) {
      try {
        const healthStatus = await checkAgentHealth(agent, supabase);
        healthChecks.push(healthStatus);
        
        // Update agent health record
        await supabase
          .from('ai_agent_health')
          .upsert({
            agent_id: agent.agent_id,
            status: healthStatus.status,
            response_time_ms: healthStatus.response_time_ms,
            success_rate: healthStatus.success_rate,
            error_count: healthStatus.error_count,
            last_check_at: new Date().toISOString(),
            metadata: healthStatus.metadata
          });

        console.log(`✅ Health check completed for agent ${agent.name}: ${healthStatus.status}`);

      } catch (error) {
        console.error(`❌ Health check failed for agent ${agent.name}:`, error);
        
        // Record failed health check
        await supabase
          .from('ai_agent_health')
          .upsert({
            agent_id: agent.agent_id,
            status: 'unhealthy',
            response_time_ms: 0,
            success_rate: 0,
            error_count: 1,
            last_check_at: new Date().toISOString(),
            metadata: { 
              error: error instanceof Error ? error.message : String(error),
              check_failed: true,
              last_error_at: new Date().toISOString()
            }
          });
      }
    }

    // Analyze trends and generate recommendations
    const recommendations = await generateHealthRecommendations(healthChecks, supabase);
    
    if (recommendations.length > 0) {
      console.log(`💡 Generated ${recommendations.length} health recommendations`);
      
      await supabase
        .from('ai_recommendations')
        .insert(recommendations);
    }

    // Check for critical issues and queue automated tasks
    await checkCriticalIssues(healthChecks, supabase);

    // Log monitoring metrics
    await supabase
      .from('ai_agent_metrics')
      .insert({
        agent_id: 1, // System monitoring agent
        metric_type: 'monitoring_cycle_completed',
        metric_value: healthChecks.length,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString(),
        metadata: {
          healthy_agents: healthChecks.filter(h => h.status === 'healthy').length,
          degraded_agents: healthChecks.filter(h => h.status === 'degraded').length,
          unhealthy_agents: healthChecks.filter(h => h.status === 'unhealthy').length,
          avg_response_time: healthChecks.reduce((a, b) => a + b.response_time_ms, 0) / (healthChecks.length || 1),
          monitoring_timestamp: new Date().toISOString()
        }
      });

    const summary = {
      success: true,
      monitored_agents: agents?.length || 0,
      healthy_agents: healthChecks.filter(h => h.status === 'healthy').length,
      degraded_agents: healthChecks.filter(h => h.status === 'degraded').length,
      unhealthy_agents: healthChecks.filter(h => h.status === 'unhealthy').length,
      recommendations_generated: recommendations.length,
      timestamp: new Date().toISOString()
    };

    console.log('🎯 AI agent monitoring complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in AI agent monitoring:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkAgentHealth(agent: AIAgent, supabase: any): Promise<HealthCheck> {
  const startTime = Date.now();
  
  // Get recent tasks for this agent (last hour)
  const { data: recentTasks } = await supabase
    .from('ai_agent_tasks')
    .select('*')
    .eq('agent_id', agent.agent_id)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  const responseTime = Date.now() - startTime;

  // Calculate success rate
  let successRate = 0;
  let errorCount = 0;
  
  if (recentTasks && recentTasks.length > 0) {
    const completedTasks = recentTasks.filter((t: any) => t.status === 'completed').length;
    const failedTasks = recentTasks.filter((t: any) => t.status === 'failed').length;
    
    successRate = (completedTasks / recentTasks.length) * 100;
    errorCount = failedTasks;
  }

  // Determine health status
  let status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown' = 'unknown';
  
  if (recentTasks && recentTasks.length > 0) {
    if (successRate >= 95 && responseTime < 1000) {
      status = 'healthy';
    } else if (successRate >= 80 && responseTime < 3000) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
  } else {
    // No recent activity, check if agent should be active
    status = 'unknown';
  }

  return {
    agent_id: agent.agent_id,
    status,
    response_time_ms: responseTime,
    success_rate: successRate,
    error_count: errorCount,
    metadata: {
      recent_task_count: recentTasks?.length || 0,
      last_activity: recentTasks?.[0]?.created_at || null,
      agent_name: agent.name,
      health_check_timestamp: new Date().toISOString()
    }
  };
}

async function generateHealthRecommendations(healthChecks: HealthCheck[], supabase: any) {
  const recommendations = [];
  const now = new Date().toISOString();

  for (const check of healthChecks) {
    if (check.status === 'unhealthy') {
      recommendations.push({
        user_id: null, // System recommendation
        recommendation_type: 'agent_health_critical',
        recommendation_data: {
          agent_id: check.agent_id,
          issue_type: 'critical_health',
          current_status: check.status,
          success_rate: check.success_rate,
          response_time: check.response_time_ms,
          error_count: check.error_count
        },
        confidence_score: 0.95,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        metadata: {
          priority: 'critical',
          auto_generated: true,
          source: 'ai_agent_monitor',
          recommended_actions: [
            'Investigate agent logs for errors',
            'Check resource allocation',
            'Review recent configuration changes',
            'Consider restarting agent service'
          ]
        }
      });
    } else if (check.status === 'degraded') {
      recommendations.push({
        user_id: null,
        recommendation_type: 'agent_health_warning',
        recommendation_data: {
          agent_id: check.agent_id,
          issue_type: 'performance_degradation',
          current_status: check.status,
          success_rate: check.success_rate,
          response_time: check.response_time_ms
        },
        confidence_score: 0.75,
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
        metadata: {
          priority: 'medium',
          auto_generated: true,
          source: 'ai_agent_monitor',
          recommended_actions: [
            'Monitor agent performance trends',
            'Check system resource usage',
            'Review task queue depth'
          ]
        }
      });
    }
  }

  return recommendations;
}

async function checkCriticalIssues(healthChecks: HealthCheck[], supabase: any) {
  const criticalIssues = healthChecks.filter(h => h.status === 'unhealthy');
  
  for (const issue of criticalIssues) {
    // Queue automated diagnostic task
    await supabase
      .from('ai_agent_queue')
      .insert({
        agent_id: 1, // System agent
        task_type: 'health_diagnostic',
        priority: 1, // High priority
        payload: {
          target_agent_id: issue.agent_id,
          issue_details: issue,
          diagnostic_type: 'automated_health_check',
          timestamp: new Date().toISOString()
        },
        scheduled_for: new Date().toISOString()
      });

    console.log(`🚨 Queued diagnostic task for unhealthy agent ${issue.agent_id}`);
  }

  // If more than 50% of agents are unhealthy, create system alert
  const unhealthyPercentage = (criticalIssues.length / healthChecks.length) * 100;
  
  if (unhealthyPercentage > 50) {
    console.log(`🔥 CRITICAL: ${unhealthyPercentage.toFixed(1)}% of agents are unhealthy`);
    
    // Log critical system event
    await supabase
      .from('audit_logs')
      .insert({
        action: 'system_health_critical',
        action_details: {
          unhealthy_percentage: unhealthyPercentage,
          total_agents: healthChecks.length,
          unhealthy_agents: criticalIssues.length,
          alert_level: 'critical',
          timestamp: new Date().toISOString(),
          requires_immediate_attention: true
        }
      });
  }
}