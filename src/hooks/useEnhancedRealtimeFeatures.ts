import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface RealtimeSession {
  id: string;
  user_id: string;
  session_id: string;
  channel_name: string;
  presence_data: any;
  last_seen: string;
  status: 'online' | 'idle' | 'offline';
  device_info: any;
}

interface CollaborativeDocument {
  id: string;
  document_name: string;
  document_type: 'design' | 'text' | 'code';
  content: any;
  version: number;
  owner_id: string;
  collaborators: string[];
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
  lock_info?: any;
  created_at: string;
  updated_at: string;
}

interface SystemHealthMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  component_name: string;
  timestamp: string;
  metadata: any;
  alert_threshold_exceeded: boolean;
}

export const useEnhancedRealtimeFeatures = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeChannels, setActiveChannels] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // Start realtime session
  const startRealtimeSession = useMutation({
    mutationFn: async (params: {
      channelName: string;
      presenceData?: any;
      deviceInfo?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const sessionId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('realtime_sessions')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          channel_name: params.channelName,
          presence_data: params.presenceData || {},
          device_info: params.deviceInfo || {},
          status: 'online'
        });

      if (error) throw error;
      return { sessionId, channelName: params.channelName };
    },
    onSuccess: (data) => {
      setActiveChannels(prev => new Set([...prev, data.channelName]));
      setConnectionStatus('connected');
    }
  });

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async (params: {
      sessionId: string;
      status: 'online' | 'idle' | 'offline';
      presenceData?: any;
    }) => {
      const { error } = await supabase
        .from('realtime_sessions')
        .update({
          status: params.status,
          presence_data: params.presenceData,
          last_seen: new Date().toISOString()
        })
        .eq('session_id', params.sessionId);

      if (error) throw error;
    }
  });

  // Get active sessions for a channel
  const useChannelSessions = (channelName: string) => {
    return useQuery({
      queryKey: ['channel-sessions', channelName],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('realtime_sessions')
          .select('*')
          .eq('channel_name', channelName)
          .in('status', ['online', 'idle'])
          .order('last_seen', { ascending: false });

        if (error) throw error;
        return data as RealtimeSession[];
      },
      enabled: !!channelName,
      refetchInterval: 30000 // Refresh every 30 seconds
    });
  };

  // Create collaborative document
  const createCollaborativeDocument = useMutation({
    mutationFn: async (params: {
      documentName: string;
      documentType: 'design' | 'text' | 'code';
      content: any;
      collaborators?: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collaborative_documents')
        .insert({
          document_name: params.documentName,
          document_type: params.documentType,
          content: params.content,
          owner_id: user.id,
          collaborators: params.collaborators || [],
          permissions: {
            read: params.collaborators || [],
            write: params.collaborators || [],
            admin: [user.id]
          }
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        collaborators: data.collaborators as string[],
        permissions: data.permissions as { read: string[]; write: string[]; admin: string[]; }
      } as CollaborativeDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-documents'] });
    }
  });

  // Update document content with conflict resolution
  const updateDocumentContent = useMutation({
    mutationFn: async (params: {
      documentId: string;
      content: any;
      expectedVersion: number;
    }) => {
      // Optimistic locking approach
      const { data, error } = await supabase
        .from('collaborative_documents')
        .update({
          content: params.content,
          version: params.expectedVersion + 1
        })
        .eq('id', params.documentId)
        .eq('version', params.expectedVersion)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Version conflict - fetch latest version
          const { data: latest } = await supabase
            .from('collaborative_documents')
            .select('*')
            .eq('id', params.documentId)
            .single();
          
          throw new Error(`Version conflict. Latest version is ${latest?.version}`);
        }
        throw error;
      }
      
      return {
        ...data,
        collaborators: data.collaborators as string[],
        permissions: data.permissions as { read: string[]; write: string[]; admin: string[]; }
      } as CollaborativeDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-documents'] });
    }
  });

  // Get user's collaborative documents
  const useCollaborativeDocuments = () => {
    return useQuery({
      queryKey: ['collaborative-documents'],
      queryFn: async () => {
        if (!user) return [];

        const { data, error } = await supabase
          .from('collaborative_documents')
          .select('*')
          .or(`owner_id.eq.${user.id},collaborators.cs.["${user.id}"]`)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data.map(doc => ({
          ...doc,
          collaborators: doc.collaborators as string[],
          permissions: doc.permissions as { read: string[]; write: string[]; admin: string[]; }
        })) as CollaborativeDocument[];
      },
      enabled: !!user
    });
  };

  // Send priority notification
  const sendPriorityNotification = useMutation({
    mutationFn: async (params: {
      userId: string;
      type: string;
      priority: number;
      title: string;
      message: string;
      payload?: any;
      deliveryMethods?: string[];
      scheduledFor?: string;
    }) => {
      const { error } = await supabase
        .from('realtime_notification_queue')
        .insert({
          user_id: params.userId,
          notification_type: params.type,
          priority: params.priority,
          title: params.title,
          message: params.message,
          payload: params.payload || {},
          delivery_method: params.deliveryMethods || ['in_app'],
          scheduled_for: params.scheduledFor || new Date().toISOString()
        });

      if (error) throw error;
    }
  });

  // Track system health metric
  const trackSystemHealthMetric = useMutation({
    mutationFn: async (params: {
      metricName: string;
      metricValue: number;
      metricUnit: string;
      componentName: string;
      metadata?: any;
      alertThresholdExceeded?: boolean;
    }) => {
      const { error } = await supabase
        .from('system_health_metrics')
        .insert({
          metric_name: params.metricName,
          metric_value: params.metricValue,
          metric_unit: params.metricUnit,
          component_name: params.componentName,
          metadata: params.metadata || {},
          alert_threshold_exceeded: params.alertThresholdExceeded || false
        });

      if (error) throw error;
    }
  });

  // Get system health metrics
  const useSystemHealthMetrics = (componentName?: string, timeRange = '1h') => {
    return useQuery({
      queryKey: ['system-health-metrics', componentName, timeRange],
      queryFn: async () => {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - parseInt(timeRange.replace('h', '')));

        let query = supabase
          .from('system_health_metrics')
          .select('*')
          .gte('timestamp', startTime.toISOString())
          .order('timestamp', { ascending: false });

        if (componentName) {
          query = query.eq('component_name', componentName);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as SystemHealthMetric[];
      },
      refetchInterval: 30000 // Refresh every 30 seconds
    });
  };

  // Track analytics event in real-time
  const trackRealtimeAnalyticsEvent = useMutation({
    mutationFn: async (params: {
      eventName: string;
      eventCategory: 'user_action' | 'system_event' | 'performance';
      eventData: any;
      sessionId?: string;
    }) => {
      const { error } = await supabase
        .from('realtime_analytics_events')
        .insert({
          event_name: params.eventName,
          event_category: params.eventCategory,
          user_id: user?.id || null,
          session_id: params.sessionId || null,
          event_data: params.eventData
        });

      if (error) throw error;
    }
  });

  // Setup real-time subscriptions for enhanced features
  useEffect(() => {
    if (!user) return;

    const channels: any[] = [];

    // Subscribe to session updates
    const sessionChannel = supabase
      .channel('realtime-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'realtime_sessions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['channel-sessions'] });
        }
      )
      .subscribe();

    channels.push(sessionChannel);

    // Subscribe to collaborative document updates
    const docChannel = supabase
      .channel('collaborative-documents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborative_documents'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['collaborative-documents'] });
        }
      )
      .subscribe();

    channels.push(docChannel);

    // Subscribe to priority notifications
    const notificationChannel = supabase
      .channel('priority-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_notification_queue',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Handle high-priority notifications immediately
          if (payload.new.priority <= 3) {
            // Could trigger toast, sound, or other immediate feedback
            console.log('High priority notification:', payload.new);
          }
        }
      )
      .subscribe();

    channels.push(notificationChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, queryClient]);

  // Cleanup sessions on unmount
  const cleanupSession = useCallback(async (sessionId: string) => {
    await supabase
      .from('realtime_sessions')
      .update({ status: 'offline' })
      .eq('session_id', sessionId);
  }, []);

  return {
    // Session management
    startRealtimeSession,
    updateSessionStatus,
    useChannelSessions,
    cleanupSession,
    
    // Collaborative features
    createCollaborativeDocument,
    updateDocumentContent,
    useCollaborativeDocuments,
    
    // Enhanced notifications
    sendPriorityNotification,
    
    // System monitoring
    trackSystemHealthMetric,
    useSystemHealthMetrics,
    
    // Analytics
    trackRealtimeAnalyticsEvent,
    
    // State
    activeChannels,
    connectionStatus
  };
};