import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Lock,
  Eye,
  Ban,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  details: any;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface SecurityMetrics {
  total_events: number;
  active_threats: number;
  resolved_threats: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time monitoring
    const channel = supabase
      .channel('security-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'security_events'
      }, (payload) => {
        const newEvent = payload.new as SecurityEvent;
        setEvents(prev => [newEvent, ...prev]);
        
        if (newEvent.severity === 'critical' || newEvent.severity === 'high') {
          toast({
            title: 'Security Alert',
            description: `${newEvent.event_type} detected`,
            variant: 'destructive'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadSecurityData = async () => {
    try {
      // Load recent security events
      const { data: eventsData } = await supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (eventsData) {
        const transformedEvents = eventsData.map(event => ({
          ...event,
          status: event.resolved ? 'resolved' as const : 'active' as const,
          severity: (event.severity === 'critical' || event.severity === 'high' || 
                    event.severity === 'medium' || event.severity === 'low') 
                    ? event.severity as 'critical' | 'high' | 'medium' | 'low'
                    : 'medium' as const
        }));
        setEvents(transformedEvents);
      }

      // Calculate metrics
      const activeThreats = eventsData?.filter(e => !e.resolved).length || 0;
      const resolvedThreats = eventsData?.filter(e => e.resolved).length || 0;
      const criticalEvents = eventsData?.filter(e => e.severity === 'critical').length || 0;
      
      const threatLevel = criticalEvents > 0 ? 'critical' : 
                         activeThreats > 5 ? 'high' : 
                         activeThreats > 2 ? 'medium' : 'low';

      setMetrics({
        total_events: eventsData?.length || 0,
        active_threats: activeThreats,
        resolved_threats: resolvedThreats,
        threat_level: threatLevel
      });
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveEvent = async (eventId: string) => {
    try {
      await supabase
        .from('security_events')
        .update({ resolved: true })
        .eq('id', eventId);
      
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, status: 'resolved' } : event
      ));
      
      toast({
        title: 'Event Resolved',
        description: 'Security event has been marked as resolved'
      });
    } catch (error) {
      console.error('Error resolving event:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Loading security data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Monitor</h2>
          <p className="text-muted-foreground">Real-time security monitoring and threat detection</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getThreatLevelColor(metrics?.threat_level || 'low')}`} />
          <span className="text-sm font-medium capitalize">{metrics?.threat_level} Threat Level</span>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_events || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics?.active_threats || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{metrics?.resolved_threats || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection</CardTitle>
            <Shield className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-blue-500">ACTIVE</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {events.filter(e => e.status === 'active' && (e.severity === 'critical' || e.severity === 'high')).length > 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            {events.filter(e => e.status === 'active' && (e.severity === 'critical' || e.severity === 'high')).length} high-priority security events require attention
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security events and threats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(event.severity)}
                  <div>
                    <div className="font-medium">{event.event_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={event.status === 'active' ? 'destructive' : 'secondary'}>
                    {event.status}
                  </Badge>
                  {event.status === 'active' && (
                    <Button 
                      size="sm" 
                      onClick={() => resolveEvent(event.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};