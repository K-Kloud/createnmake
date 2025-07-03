import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AIAgent {
  agent_id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
}

interface AIAgentHealth {
  id: string;
  agent_id: number;
  status: string;
  last_check_at: string;
  response_time_ms: number | null;
  success_rate: number | null;
  metadata: any;
}

interface AIAgentMetrics {
  id: string;
  agent_id: number;
  metric_type: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  recorded_at: string;
}

interface QueueTask {
  id: string;
  agent_id: number;
  task_type: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  scheduled_for: string;
  error_message?: string;
}

export const useAIAgentMonitoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all AI agents with health status
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['ai-agents-with-health'],
    queryFn: async (): Promise<(AIAgent & { health?: AIAgentHealth })[]> => {
      const { data: agentsData, error: agentsError } = await supabase
        .from('ai_agent')
        .select('*')
        .order('agent_id');

      if (agentsError) throw agentsError;

      const { data: healthData, error: healthError } = await supabase
        .from('ai_agent_health')
        .select('*');

      if (healthError) throw healthError;

      return agentsData.map(agent => ({
        ...agent,
        health: healthData.find(h => h.agent_id === agent.agent_id)
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get queue statistics
  const { data: queueStats } = useQuery({
    queryKey: ['ai-agent-queue-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agent_queue')
        .select('agent_id, status, priority')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const stats = {
        pending: data.filter(item => item.status === 'pending').length,
        processing: data.filter(item => item.status === 'processing').length,
        completed: data.filter(item => item.status === 'completed').length,
        failed: data.filter(item => item.status === 'failed').length,
        byAgent: {} as Record<number, any>
      };

      data.forEach(item => {
        if (!stats.byAgent[item.agent_id]) {
          stats.byAgent[item.agent_id] = {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0
          };
        }
        stats.byAgent[item.agent_id][item.status]++;
      });

      return stats;
    },
    refetchInterval: 15000,
  });

  // Get recent metrics
  const { data: recentMetrics } = useQuery({
    queryKey: ['ai-agent-recent-metrics'],
    queryFn: async (): Promise<AIAgentMetrics[]> => {
      const { data, error } = await supabase
        .from('ai_agent_metrics')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  // Trigger health check
  const triggerHealthCheck = useMutation({
    mutationFn: async (agentId: number) => {
      const { data, error } = await supabase
        .rpc('check_ai_agent_health', { p_agent_id: agentId });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents-with-health'] });
      toast({
        title: 'Health Check Complete',
        description: 'Agent health status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Health Check Failed',
        description: `Failed to check agent health: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Queue a task
  const queueTask = useMutation({
    mutationFn: async ({ 
      agentId, 
      taskType, 
      payload, 
      priority = 5 
    }: { 
      agentId: number; 
      taskType: string; 
      payload: any; 
      priority?: number; 
    }) => {
      const { data, error } = await supabase
        .rpc('queue_ai_agent_task', {
          p_agent_id: agentId,
          p_task_type: taskType,
          p_payload: payload,
          p_priority: priority
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent-queue-stats'] });
      toast({
        title: 'Task Queued',
        description: 'Task has been added to the processing queue',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Queue Task',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Toggle agent status
  const toggleAgentStatus = useMutation({
    mutationFn: async ({ agentId, active }: { agentId: number; active: boolean }) => {
      const { error } = await supabase
        .from('ai_agent')
        .update({ active })
        .eq('agent_id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents-with-health'] });
      toast({
        title: 'Agent Status Updated',
        description: 'Agent status changed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Update Status',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Manually trigger monitoring
  const triggerMonitoring = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-agent-monitor', {
        body: { manual: true }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents-with-health'] });
      queryClient.invalidateQueries({ queryKey: ['ai-agent-queue-stats'] });
      toast({
        title: 'Monitoring Triggered',
        description: 'AI agent monitoring has been manually executed',
      });
    },
    onError: (error) => {
      toast({
        title: 'Monitoring Failed',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  return {
    agents,
    agentsLoading,
    queueStats,
    recentMetrics,
    triggerHealthCheck: triggerHealthCheck.mutate,
    queueTask: queueTask.mutate,
    toggleAgentStatus: toggleAgentStatus.mutate,
    triggerMonitoring: triggerMonitoring.mutate,
    isTriggering: triggerHealthCheck.isPending || triggerMonitoring.isPending
  };
};