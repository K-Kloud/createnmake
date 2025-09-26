import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MLProcessingRequest {
  image_data: string;
  task_type: 'classification' | 'enhancement' | 'generation';
  parameters?: Record<string, any>;
}

interface MLProcessingResponse {
  result: any;
  processing_time: number;
  model_used: string;
  confidence?: number;
}

interface RealtimeConnection {
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
}

export const useMultiStackServices = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [realtimeConnection, setRealtimeConnection] = useState<RealtimeConnection | null>(null);

  // Python ML Service Integration
  const processWithML = useCallback(async (request: MLProcessingRequest): Promise<MLProcessingResponse> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ml-gateway', {
        body: {
          service: 'python-ml',
          endpoint: '/process',
          method: 'POST',
          data: request
        }
      });

      if (error) throw error;
      return data;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Go Performance Service Integration
  const performanceOperation = useCallback(async (operation: string, data: any) => {
    const { data: result, error } = await supabase.functions.invoke('performance-gateway', {
      body: {
        service: 'go-performance',
        endpoint: `/${operation}`,
        method: 'POST',
        data
      }
    });

    if (error) throw error;
    return result;
  }, []);

  // Real-time Service Integration
  const connectRealtime = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const ws = new WebSocket(`${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://localhost:8003/ws`);
    
    const connection: RealtimeConnection = {
      connect: () => {
        ws.send(JSON.stringify({ type: 'auth', token: session.access_token }));
      },
      disconnect: () => {
        ws.close();
      },
      emit: (event: string, data: any) => {
        ws.send(JSON.stringify({ type: event, data }));
      },
      on: (event: string, callback: (data: any) => void) => {
        ws.addEventListener('message', (message) => {
          const parsed = JSON.parse(message.data);
          if (parsed.type === event) {
            callback(parsed.data);
          }
        });
      }
    };

    setRealtimeConnection(connection);
    return connection;
  }, []);

  // Analytics and Insights
  const getAnalytics = useCallback(async (timeRange: string, metrics: string[]) => {
    const { data, error } = await supabase.functions.invoke('analytics-gateway', {
      body: {
        timeRange,
        metrics,
        userId: (await supabase.auth.getUser()).data.user?.id
      }
    });

    if (error) throw error;
    return data;
  }, []);

  return {
    // ML Services
    processWithML,
    isProcessing,
    
    // Performance Services
    performanceOperation,
    
    // Real-time Services
    connectRealtime,
    realtimeConnection,
    
    // Analytics
    getAnalytics
  };
};