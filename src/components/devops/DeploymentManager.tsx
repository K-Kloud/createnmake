import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  GitBranch, 
  Server, 
  Shield, 
  Monitor,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'active' | 'deploying' | 'error' | 'maintenance';
  version: string;
  last_deployed: string;
  health_score: number;
  instances: number;
  cpu_usage: number;
  memory_usage: number;
}

interface DeploymentPipeline {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  branch: string;
  commit: string;
  started_at: string;
  duration: number;
  stages: PipelineStage[];
}

interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration: number;
}

export const DeploymentManager: React.FC = () => {
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDeploymentData();
    const interval = setInterval(loadDeploymentData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDeploymentData = async () => {
    try {
      // Simulate deployment environments
      const mockEnvironments: DeploymentEnvironment[] = [
        {
          id: '1',
          name: 'Production',
          type: 'production',
          status: 'active',
          version: 'v2.1.0',
          last_deployed: '2024-01-15T10:30:00Z',
          health_score: 98.5,
          instances: 6,
          cpu_usage: 45.2,
          memory_usage: 62.8
        },
        {
          id: '2',
          name: 'Staging',
          type: 'staging',
          status: 'deploying',
          version: 'v2.1.1-rc1',
          last_deployed: '2024-01-15T14:20:00Z',
          health_score: 95.1,
          instances: 3,
          cpu_usage: 38.7,
          memory_usage: 55.3
        },
        {
          id: '3',
          name: 'Development',
          type: 'development',
          status: 'active',
          version: 'v2.2.0-dev',
          last_deployed: '2024-01-15T16:45:00Z',
          health_score: 92.3,
          instances: 2,
          cpu_usage: 28.1,
          memory_usage: 41.6
        }
      ];

      const mockPipelines: DeploymentPipeline[] = [
        {
          id: '1',
          name: 'Feature/new-dashboard',
          status: 'running',
          branch: 'feature/new-dashboard',
          commit: 'a1b2c3d',
          started_at: '2024-01-15T16:00:00Z',
          duration: 480,
          stages: [
            { name: 'Build', status: 'success', duration: 120 },
            { name: 'Test', status: 'success', duration: 180 },
            { name: 'Security Scan', status: 'running', duration: 90 },
            { name: 'Deploy to Staging', status: 'pending', duration: 0 },
            { name: 'Integration Tests', status: 'pending', duration: 0 }
          ]
        },
        {
          id: '2',
          name: 'Hotfix/auth-issue',
          status: 'success',
          branch: 'hotfix/auth-issue',
          commit: 'e4f5g6h',
          started_at: '2024-01-15T14:30:00Z',
          duration: 420,
          stages: [
            { name: 'Build', status: 'success', duration: 110 },
            { name: 'Test', status: 'success', duration: 160 },
            { name: 'Security Scan', status: 'success', duration: 80 },
            { name: 'Deploy to Production', status: 'success', duration: 70 }
          ]
        }
      ];

      setEnvironments(mockEnvironments);
      setPipelines(mockPipelines);
    } catch (error) {
      console.error('Error loading deployment data:', error);
    }
  };

  const triggerDeployment = async (environmentId: string) => {
    setIsDeploying(true);
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Deployment Started",
        description: "Deployment pipeline has been triggered successfully."
      });
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Failed to trigger deployment pipeline.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const rollbackDeployment = async (environmentId: string) => {
    try {
      // Simulate rollback process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Rollback Complete",
        description: "Environment has been rolled back to previous version."
      });
    } catch (error) {
      toast({
        title: "Rollback Failed",
        description: "Failed to rollback deployment.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deploying':
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Monitor className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'deploying':
      case 'running':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'error':
      case 'failed':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'maintenance':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'production':
        return <Rocket className="w-4 h-4 text-red-500" />;
      case 'staging':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'development':
        return <GitBranch className="w-4 h-4 text-blue-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Deployment Manager</h2>
          <p className="text-muted-foreground">Multi-environment deployment and pipeline management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => triggerDeployment('2')}
            disabled={isDeploying}
            className="gap-2"
          >
            {isDeploying ? (
              <>
                <Pause className="w-4 h-4" />
                Deploying...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Deploy to Staging
              </>
            )}
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Environment Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {environments.map((env) => (
          <Card key={env.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {getEnvironmentIcon(env.type)}
                <CardTitle className="text-lg font-medium">{env.name}</CardTitle>
              </div>
              {getStatusIcon(env.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={getStatusColor(env.status)}>
                    {env.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">{env.version}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Health Score</span>
                    <span className="text-sm font-medium">{env.health_score}%</span>
                  </div>
                  <Progress value={env.health_score} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Instances: </span>
                    <span className="font-medium">{env.instances}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPU: </span>
                    <span className="font-medium">{env.cpu_usage.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => triggerDeployment(env.id)}
                    disabled={env.status === 'deploying'}
                  >
                    <Rocket className="w-3 h-3 mr-1" />
                    Deploy
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => rollbackDeployment(env.id)}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pipelines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipelines">Active Pipelines</TabsTrigger>
          <TabsTrigger value="history">Deployment History</TabsTrigger>
          <TabsTrigger value="settings">Pipeline Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Pipelines</CardTitle>
              <CardDescription>Current and recent deployment pipeline executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pipelines.map((pipeline) => (
                  <div key={pipeline.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(pipeline.status)}
                        <div>
                          <h4 className="font-medium">{pipeline.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Branch: {pipeline.branch} • Commit: {pipeline.commit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor(pipeline.status)}>
                          {pipeline.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: {Math.floor(pipeline.duration / 60)}m {pipeline.duration % 60}s
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {pipeline.stages.map((stage, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-6 flex justify-center">
                            {getStatusIcon(stage.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{stage.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {stage.duration > 0 ? `${stage.duration}s` : '-'}
                              </span>
                            </div>
                            {stage.status === 'running' && (
                              <Progress value={60} className="h-1 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
              <CardDescription>Recent deployment activities across all environments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <h4 className="font-medium">Production Deployment</h4>
                        <p className="text-sm text-muted-foreground">v2.1.0 deployed to production</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-1">Success</Badge>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <h4 className="font-medium">Staging Deployment</h4>
                        <p className="text-sm text-muted-foreground">v2.1.1-rc1 deployed to staging</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-1">Success</Badge>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Configuration</CardTitle>
              <CardDescription>Configure deployment pipeline settings and automation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Deploy to Staging</h4>
                    <p className="text-sm text-muted-foreground">Automatically deploy successful builds to staging</p>
                  </div>
                  <Button variant="outline">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Production Approval</h4>
                    <p className="text-sm text-muted-foreground">Require manual approval for production deployments</p>
                  </div>
                  <Button variant="outline">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Rollback Strategy</h4>
                    <p className="text-sm text-muted-foreground">Configure automatic rollback conditions</p>
                  </div>
                  <Button variant="outline">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};