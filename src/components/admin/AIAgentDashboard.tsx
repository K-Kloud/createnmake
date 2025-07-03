import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Settings, Activity } from 'lucide-react';
import { useAIAgentMonitoring } from '@/hooks/useAIAgentMonitoring';
import { AIMonitoringAlerts } from './AIMonitoringAlerts';
import { format } from 'date-fns';

export const AIAgentDashboard = () => {
  const {
    agents,
    agentsLoading,
    queueStats,
    recentMetrics,
    performanceLogs,
    alertConfigs,
    triggerHealthCheck,
    toggleAgentStatus,
    triggerMonitoring,
    triggerDatabaseMonitoring,
    isTriggering
  } = useAIAgentMonitoring();

  if (agentsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success border-success';
      case 'degraded': return 'text-warning border-warning';
      case 'unhealthy': return 'text-destructive border-destructive';
      case 'offline': return 'text-muted border-muted';
      default: return 'text-muted border-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Monitoring</h1>
          <p className="text-muted-foreground">Monitor and manage AI agent health and performance</p>
        </div>
        <Button 
          onClick={() => triggerMonitoring()} 
          disabled={isTriggering}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents?.length || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healthy Agents</p>
                <p className="text-2xl font-bold text-success">
                  {agents?.filter(a => a.health?.status === 'healthy').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Queue Pending</p>
                <p className="text-2xl font-bold text-warning">{queueStats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Tasks</p>
                <p className="text-2xl font-bold text-destructive">{queueStats?.failed || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents?.map((agent) => (
          <Card key={agent.agent_id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">{agent.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={agent.active ? "default" : "secondary"}
                  className={agent.health?.status ? getStatusColor(agent.health.status) : ''}
                >
                  {agent.health?.status ? getStatusIcon(agent.health.status) : <Clock className="h-4 w-4" />}
                  {agent.health?.status || 'Unknown'}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleAgentStatus({ agentId: agent.agent_id, active: !agent.active })}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                
                {agent.health && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{agent.health.success_rate?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={agent.health.success_rate || 0} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Response Time</span>
                        <p className="font-medium">{agent.health.response_time_ms || 0}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Check</span>
                        <p className="font-medium">
                          {agent.health.last_check_at 
                            ? format(new Date(agent.health.last_check_at), 'HH:mm:ss')
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>

                    {queueStats?.byAgent[agent.agent_id] && (
                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <div className="text-center">
                          <div className="text-warning font-medium">
                            {queueStats.byAgent[agent.agent_id].pending || 0}
                          </div>
                          <div className="text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-success font-medium">
                            {queueStats.byAgent[agent.agent_id].completed || 0}
                          </div>
                          <div className="text-muted-foreground">Completed</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => triggerHealthCheck(agent.agent_id)}
                  className="w-full"
                  disabled={isTriggering}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isTriggering ? 'animate-spin' : ''}`} />
                  Check Health
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <AIMonitoringAlerts />

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Control Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => triggerMonitoring()}
              disabled={isTriggering}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`} />
              Run Health Check
            </Button>
            
            <Button
              onClick={() => triggerDatabaseMonitoring()}
              disabled={isTriggering}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Activity className={`h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`} />
              Database Trigger
            </Button>

            <Button
              onClick={() => window.open('https://supabase.com/dashboard/project/f1ed4079-3ff6-4e5a-a513-6277112295ba/functions/ai-agent-monitor/logs', '_blank')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Logs */}
      {performanceLogs && performanceLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {performanceLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={log.success ? "default" : "destructive"}>
                      {log.operation_type}
                    </Badge>
                    <span className="text-sm">Agent {log.agent_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {log.duration_ms ? `${log.duration_ms}ms` : 'N/A'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Configuration */}
      {alertConfigs && alertConfigs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertConfigs.map((config) => (
                <div key={config.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{config.alert_type}</Badge>
                    <span className="text-sm">Agent {config.agent_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {config.threshold_operator} {config.threshold_value}
                    </span>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Metrics */}
      {recentMetrics && recentMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentMetrics.slice(0, 10).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{metric.metric_type}</Badge>
                    <span className="text-sm">Agent {metric.agent_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{metric.metric_value}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(metric.recorded_at), 'HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};