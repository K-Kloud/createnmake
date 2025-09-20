import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Calendar,
  Target,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { useProductionMonitoring } from '@/hooks/useProductionMonitoring';
import { ProductionSchedule, ProductionTask } from '@/services/productionScheduler';

interface ProductionDashboardProps {
  workflowId?: string;
  schedule?: ProductionSchedule;
  onTaskUpdate?: (taskId: string, status: ProductionTask['status']) => void;
}

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({
  workflowId,
  schedule: externalSchedule,
  onTaskUpdate
}) => {
  const {
    schedule: monitoredSchedule,
    progress,
    monitoring,
    updateTaskStatus,
    startMonitoring,
    stopMonitoring,
    getTasksByStatus,
    getCriticalTasks,
    getUpcomingTasks,
    getOverdueTasks,
    getBottleneckAnalysis
  } = useProductionMonitoring(externalSchedule?.id);

  const schedule = externalSchedule || monitoredSchedule;
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (!schedule) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Production Schedule</h3>
          <p className="text-muted-foreground">
            Create a production schedule to monitor your workflow progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedTasks = getTasksByStatus('completed');
  const inProgressTasks = getTasksByStatus('in_progress');
  const pendingTasks = getTasksByStatus('pending');
  const criticalTasks = getCriticalTasks();
  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();
  const bottleneckAnalysis = getBottleneckAnalysis();

  const overallProgress = progress?.overallProgress || 
    Math.round((completedTasks.length / schedule.tasks.length) * 100);

  const handleTaskStatusUpdate = async (taskId: string, status: ProductionTask['status']) => {
    await updateTaskStatus(taskId, status);
    onTaskUpdate?.(taskId, status);
  };

  const getStatusColor = (status: ProductionTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'failed': return 'bg-red-600';
      case 'assigned': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: ProductionTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks</p>
                <p className="text-2xl font-bold">
                  {completedTasks.length}/{schedule.tasks.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressTasks.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-red-500">
                  {criticalTasks.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Real-time Monitoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={monitoring ? "default" : "secondary"}>
                {monitoring ? "Active" : "Inactive"}
              </Badge>
              <Button
                onClick={monitoring ? stopMonitoring : () => startMonitoring(schedule.id)}
                size="sm"
                variant={monitoring ? "destructive" : "default"}
              >
                {monitoring ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {progress && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Estimated Completion:</span>
                <p className="font-medium">
                  {new Date(progress.estimatedCompletion).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">On Schedule:</span>
                <p className={`font-medium ${progress.isOnSchedule ? 'text-green-600' : 'text-red-600'}`}>
                  {progress.isOnSchedule ? 'Yes' : 'Behind'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Blocked Tasks:</span>
                <p className="font-medium">{progress.blockedTasks}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Efficiency:</span>
                <p className="font-medium">{schedule.efficiency}%</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="bottlenecks">Issues</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Critical Tasks Alert */}
          {criticalTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Tasks Require Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {criticalTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <span className="font-medium">{task.title}</span>
                        <Badge variant={getPriorityColor(task.priority)} className="ml-2">
                          {task.priority}
                        </Badge>
                      </div>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle>Production Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      selectedTaskId === task.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                        <span className="font-medium">{task.title}</span>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{task.status}</Badge>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {task.estimatedDuration}min
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Type: {task.taskType}</span>
                      {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
                      {task.scheduledStart && (
                        <span>Start: {new Date(task.scheduledStart).toLocaleDateString()}</span>
                      )}
                    </div>

                    {selectedTaskId === task.id && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                            >
                              Start Task
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          {(task.status === 'pending' || task.status === 'in_progress') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleTaskStatusUpdate(task.id, 'blocked')}
                            >
                              Block
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Production Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{milestone.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            milestone.status === 'completed' ? 'default' :
                            milestone.status === 'at_risk' ? 'destructive' :
                            milestone.status === 'missed' ? 'destructive' : 'secondary'
                          }
                        >
                          {milestone.status}
                        </Badge>
                        {milestone.criticalPath && (
                          <Badge variant="outline" className="text-red-600">
                            Critical Path
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                      <span>Tasks: {milestone.tasks.length}</span>
                      {milestone.actualDate && (
                        <span>Completed: {new Date(milestone.actualDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          {bottleneckAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Bottleneck Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{bottleneckAnalysis.critical}</div>
                      <div className="text-sm text-muted-foreground">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{bottleneckAnalysis.high}</div>
                      <div className="text-sm text-muted-foreground">High Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{bottleneckAnalysis.total}</div>
                      <div className="text-sm text-muted-foreground">Total Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(bottleneckAnalysis.estimatedDelay / 60)}h
                      </div>
                      <div className="text-sm text-muted-foreground">Est. Delay</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Identified Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.bottlenecks.map((bottleneck) => (
                      <div key={bottleneck.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{bottleneck.description}</span>
                          <Badge 
                            variant={
                              bottleneck.impact === 'critical' ? 'destructive' :
                              bottleneck.impact === 'high' ? 'destructive' : 'secondary'
                            }
                          >
                            {bottleneck.impact} impact
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Type: {bottleneck.type} • 
                          Estimated delay: {Math.round(bottleneck.estimatedDelay / 60)} hours
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {bottleneck.suggestedActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span>•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Production Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upcoming Tasks */}
                {upcomingTasks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-blue-600">Upcoming (Next 24h)</h4>
                    <div className="space-y-2">
                      {upcomingTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">{task.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {task.scheduledStart && new Date(task.scheduledStart).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-red-600">Overdue Tasks</h4>
                    <div className="space-y-2">
                      {overdueTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm">{task.title}</span>
                          <span className="text-xs text-muted-foreground">
                            Due: {task.scheduledEnd && new Date(task.scheduledEnd).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule Overview */}
                <div>
                  <h4 className="font-medium mb-3">Schedule Overview</h4>
                  <div className="space-y-1">
                    {schedule.tasks
                      .filter(task => task.scheduledStart)
                      .sort((a, b) => new Date(a.scheduledStart!).getTime() - new Date(b.scheduledStart!).getTime())
                      .map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded text-sm">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                          <span className="flex-1">{task.title}</span>
                          <span className="text-muted-foreground">
                            {task.scheduledStart && new Date(task.scheduledStart).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};