import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp, 
  TrendingDown, 
  Server, 
  Database, 
  Network,
  Gauge,
  Activity,
  Settings,
  Plus,
  Minus,
  BarChart3,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ScalingGroup {
  id: string;
  name: string;
  service: string;
  current_instances: number;
  min_instances: number;
  max_instances: number;
  target_cpu: number;
  target_memory: number;
  current_cpu: number;
  current_memory: number;
  status: 'stable' | 'scaling_up' | 'scaling_down' | 'error';
  last_scaled: string;
  auto_scaling: boolean;
}

interface ScalingEvent {
  id: string;
  group_name: string;
  action: 'scale_up' | 'scale_down';
  from_instances: number;
  to_instances: number;
  trigger: string;
  timestamp: string;
  duration: number;
}

interface LoadBalancer {
  id: string;
  name: string;
  type: 'application' | 'network';
  status: 'active' | 'provisioning' | 'error';
  targets: number;
  healthy_targets: number;
  requests_per_second: number;
  response_time: number;
}

export const AutoScalingManager: React.FC = () => {
  const [scalingGroups, setScalingGroups] = useState<ScalingGroup[]>([]);
  const [scalingEvents, setScalingEvents] = useState<ScalingEvent[]>([]);
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadScalingData();
    const interval = setInterval(loadScalingData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadScalingData = async () => {
    try {
      // Simulate scaling groups
      const mockGroups: ScalingGroup[] = [
        {
          id: '1',
          name: 'Web Servers',
          service: 'frontend',
          current_instances: 4,
          min_instances: 2,
          max_instances: 10,
          target_cpu: 70,
          target_memory: 80,
          current_cpu: 65.4,
          current_memory: 72.1,
          status: 'stable',
          last_scaled: '2024-01-15T14:30:00Z',
          auto_scaling: true
        },
        {
          id: '2',
          name: 'API Servers',
          service: 'backend',
          current_instances: 6,
          min_instances: 3,
          max_instances: 20,
          target_cpu: 75,
          target_memory: 85,
          current_cpu: 82.3,
          current_memory: 78.9,
          status: 'scaling_up',
          last_scaled: '2024-01-15T16:45:00Z',
          auto_scaling: true
        },
        {
          id: '3',
          name: 'ML Workers',
          service: 'ml-processing',
          current_instances: 2,
          min_instances: 1,
          max_instances: 8,
          target_cpu: 80,
          target_memory: 90,
          current_cpu: 45.7,
          current_memory: 52.3,
          status: 'stable',
          last_scaled: '2024-01-15T12:15:00Z',
          auto_scaling: true
        }
      ];

      const mockEvents: ScalingEvent[] = [
        {
          id: '1',
          group_name: 'API Servers',
          action: 'scale_up',
          from_instances: 5,
          to_instances: 6,
          trigger: 'High CPU usage (82%)',
          timestamp: '2024-01-15T16:45:00Z',
          duration: 120
        },
        {
          id: '2',
          group_name: 'Web Servers',
          action: 'scale_down',
          from_instances: 5,
          to_instances: 4,
          trigger: 'Low traffic',
          timestamp: '2024-01-15T14:30:00Z',
          duration: 90
        }
      ];

      const mockLoadBalancers: LoadBalancer[] = [
        {
          id: '1',
          name: 'Frontend ALB',
          type: 'application',
          status: 'active',
          targets: 4,
          healthy_targets: 4,
          requests_per_second: 1250,
          response_time: 145
        },
        {
          id: '2',
          name: 'API Gateway',
          type: 'application',
          status: 'active',
          targets: 6,
          healthy_targets: 6,
          requests_per_second: 890,
          response_time: 98
        }
      ];

      setScalingGroups(mockGroups);
      setScalingEvents(mockEvents);
      setLoadBalancers(mockLoadBalancers);
    } catch (error) {
      console.error('Error loading scaling data:', error);
    }
  };

  const manualScale = async (groupId: string, action: 'up' | 'down') => {
    try {
      const group = scalingGroups.find(g => g.id === groupId);
      if (!group) return;

      const newInstanceCount = action === 'up' 
        ? Math.min(group.current_instances + 1, group.max_instances)
        : Math.max(group.current_instances - 1, group.min_instances);

      // Update the scaling group
      setScalingGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, current_instances: newInstanceCount, status: action === 'up' ? 'scaling_up' : 'scaling_down' }
          : g
      ));

      toast({
        title: `Manual Scaling ${action === 'up' ? 'Up' : 'Down'}`,
        description: `${group.name} is scaling ${action === 'up' ? 'up' : 'down'} to ${newInstanceCount} instances.`
      });

      // Simulate scaling completion
      setTimeout(() => {
        setScalingGroups(prev => prev.map(g => 
          g.id === groupId ? { ...g, status: 'stable' } : g
        ));
      }, 3000);
    } catch (error) {
      toast({
        title: "Scaling Failed",
        description: "Failed to trigger manual scaling.",
        variant: "destructive"
      });
    }
  };

  const toggleAutoScaling = async (groupId: string) => {
    try {
      setScalingGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, auto_scaling: !g.auto_scaling } : g
      ));

      const group = scalingGroups.find(g => g.id === groupId);
      toast({
        title: "Auto-Scaling Updated",
        description: `Auto-scaling ${group?.auto_scaling ? 'disabled' : 'enabled'} for ${group?.name}.`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update auto-scaling settings.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable':
        return <Gauge className="w-4 h-4 text-green-500" />;
      case 'scaling_up':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'scaling_down':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
      case 'active':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'scaling_up':
      case 'scaling_down':
      case 'provisioning':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Auto-Scaling Manager</h2>
          <p className="text-muted-foreground">Intelligent horizontal scaling and load balancing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Scaling Group
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </Button>
        </div>
      </div>

      {/* Scaling Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scalingGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">{group.name}</CardTitle>
              </div>
              {getStatusIcon(group.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={getStatusColor(group.status)}>
                    {group.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold">{group.current_instances}</div>
                  <div className="text-sm text-muted-foreground">
                    {group.min_instances} - {group.max_instances} instances
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CPU Usage</span>
                    <span className="text-sm font-medium">{group.current_cpu.toFixed(1)}%</span>
                  </div>
                  <Progress value={group.current_cpu} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Target: {group.target_cpu}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Memory Usage</span>
                    <span className="text-sm font-medium">{group.current_memory.toFixed(1)}%</span>
                  </div>
                  <Progress value={group.current_memory} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Target: {group.target_memory}%
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto-Scaling</span>
                  <Button
                    size="sm"
                    variant={group.auto_scaling ? "default" : "outline"}
                    onClick={() => toggleAutoScaling(group.id)}
                  >
                    {group.auto_scaling ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => manualScale(group.id, 'down')}
                    disabled={group.current_instances <= group.min_instances || group.status !== 'stable'}
                  >
                    <Minus className="w-3 h-3 mr-1" />
                    Scale Down
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => manualScale(group.id, 'up')}
                    disabled={group.current_instances >= group.max_instances || group.status !== 'stable'}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Scale Up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Scaling Events</TabsTrigger>
          <TabsTrigger value="loadbalancers">Load Balancers</TabsTrigger>
          <TabsTrigger value="policies">Scaling Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scaling Events</CardTitle>
              <CardDescription>Automatic and manual scaling activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scalingEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {event.action === 'scale_up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-yellow-500" />
                        )}
                        <div>
                          <h4 className="font-medium">
                            {event.group_name} {event.action === 'scale_up' ? 'Scaled Up' : 'Scaled Down'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {event.from_instances} → {event.to_instances} instances
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{event.duration}s</div>
                        <div className="text-xs text-muted-foreground">2 hours ago</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Trigger: {event.trigger}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loadbalancers">
          <Card>
            <CardHeader>
              <CardTitle>Load Balancers</CardTitle>
              <CardDescription>Load balancer status and traffic distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadBalancers.map((lb) => (
                  <div key={lb.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Network className="w-4 h-4 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{lb.name}</h4>
                          <p className="text-sm text-muted-foreground">{lb.type} load balancer</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(lb.status)}>
                        {lb.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Targets</span>
                        <div className="font-medium">
                          {lb.healthy_targets}/{lb.targets} healthy
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RPS</span>
                        <div className="font-medium">{lb.requests_per_second}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response Time</span>
                        <div className="font-medium">{lb.response_time}ms</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Health</span>
                        <div className="font-medium">
                          {((lb.healthy_targets / lb.targets) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Scaling Policies</CardTitle>
              <CardDescription>Configure auto-scaling triggers and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">CPU-based Scaling</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scale up threshold</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <Slider defaultValue={[75]} max={100} step={5} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scale down threshold</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <Slider defaultValue={[30]} max={100} step={5} className="w-full" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Memory-based Scaling</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scale up threshold</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Slider defaultValue={[85]} max={100} step={5} className="w-full" />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>Save Policies</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};