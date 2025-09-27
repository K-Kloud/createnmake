import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: 'threat' | 'vulnerability' | 'compliance' | 'access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved';
  affectedSystems: string[];
  metadata?: Record<string, any>;
}

interface SecurityMetric {
  name: string;
  value: number;
  max: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  timestamp: Date;
}

interface ThreatIntelligence {
  id: string;
  threatType: string;
  severity: string;
  description: string;
  indicators: string[];
  lastSeen: Date;
  confidence: number;
  sources: string[];
}

export const useSecurityMonitoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [realTimeAlerts, setRealTimeAlerts] = useState<SecurityAlert[]>([]);

  // Fetch security alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async (): Promise<SecurityAlert[]> => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map(event => ({
        id: event.id,
        type: event.event_type as SecurityAlert['type'],
        severity: event.severity as SecurityAlert['severity'],
        title: event.title,
        description: event.description,
        timestamp: new Date(event.created_at),
        status: event.status as SecurityAlert['status'],
        affectedSystems: event.affected_systems || [],
        metadata: event.metadata
      })) || [];
    },
    refetchInterval: 30000
  });

  // Fetch security metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetric[]> => {
      // In a real implementation, this would call security monitoring APIs
      // For now, return mock data or call custom functions
      const mockMetrics: SecurityMetric[] = [
        {
          name: 'Security Score',
          value: 87,
          max: 100,
          status: 'good',
          trend: 'up',
          timestamp: new Date()
        },
        {
          name: 'Active Threats',
          value: 2,
          max: 10,
          status: 'warning',
          trend: 'stable',
          timestamp: new Date()
        },
        {
          name: 'Vulnerability Count',
          value: 3,
          max: 20,
          status: 'good',
          trend: 'down',
          timestamp: new Date()
        },
        {
          name: 'Compliance Rate',
          value: 94,
          max: 100,
          status: 'good',
          trend: 'up',
          timestamp: new Date()
        }
      ];

      return mockMetrics;
    },
    refetchInterval: 60000 // Refetch every minute
  });

  // Fetch threat intelligence
  const { data: threatIntel, isLoading: threatIntelLoading } = useQuery({
    queryKey: ['threat-intelligence'],
    queryFn: async (): Promise<ThreatIntelligence[]> => {
      // Mock threat intelligence data
      const mockThreats: ThreatIntelligence[] = [
        {
          id: '1',
          threatType: 'Malware',
          severity: 'high',
          description: 'New ransomware variant detected',
          indicators: ['192.168.1.100', 'malicious-domain.com'],
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
          confidence: 85,
          sources: ['VirusTotal', 'Internal Detection']
        },
        {
          id: '2',
          threatType: 'Phishing',
          severity: 'medium',
          description: 'Credential harvesting campaign',
          indicators: ['phishing-site.net', 'fake-login.com'],
          lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000),
          confidence: 72,
          sources: ['Email Security', 'User Reports']
        }
      ];

      return mockThreats;
    },
    refetchInterval: 300000 // Refetch every 5 minutes
  });

  // Run security scan mutation
  const runSecurityScan = useMutation({
    mutationFn: async (scanType: 'vulnerability' | 'compliance' | 'full') => {
      const { data, error } = await supabase.functions.invoke('security-scan', {
        body: { scanType }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Security Scan Started",
        description: "Security scan has been initiated. Results will be available shortly."
      });
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlert = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: string }) => {
      const { data, error } = await supabase
        .from('security_events')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Alert Updated",
        description: "Security alert status has been updated."
      });
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Real-time monitoring setup
  useEffect(() => {
    const channel = supabase
      .channel('security-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events'
        },
        (payload) => {
          const newAlert: SecurityAlert = {
            id: payload.new.id,
            type: payload.new.event_type,
            severity: payload.new.severity,
            title: payload.new.title,
            description: payload.new.description,
            timestamp: new Date(payload.new.created_at),
            status: payload.new.status,
            affectedSystems: payload.new.affected_systems || [],
            metadata: payload.new.metadata
          };

          setRealTimeAlerts(prev => [newAlert, ...prev]);

          // Show toast for critical alerts
          if (newAlert.severity === 'critical') {
            toast({
              title: "Critical Security Alert",
              description: newAlert.title,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Network monitoring
  const { data: networkActivity } = useQuery({
    queryKey: ['network-activity'],
    queryFn: async () => {
      // Mock network activity data
      return {
        suspiciousConnections: 3,
        ddosAttempts: 0,
        failedLogins: 12,
        blockedIPs: ['203.0.113.1', '198.51.100.2'],
        activeConnections: 1247
      };
    },
    refetchInterval: 15000 // Refetch every 15 seconds
  });

  return {
    // Data
    alerts: [...(alerts || []), ...realTimeAlerts],
    metrics,
    threatIntel,
    networkActivity,

    // Loading states
    alertsLoading,
    metricsLoading,
    threatIntelLoading,

    // Actions
    runSecurityScan: runSecurityScan.mutate,
    isScanning: runSecurityScan.isPending,
    acknowledgeAlert: acknowledgeAlert.mutate,
    isUpdatingAlert: acknowledgeAlert.isPending,

    // Real-time alerts
    realTimeAlerts,
    clearRealTimeAlerts: () => setRealTimeAlerts([])
  };
};