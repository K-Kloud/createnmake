import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  MessageSquare, 
  User, 
  TrendingUp, 
  Cpu, 
  Activity,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { ComputerVisionPipeline } from './ComputerVisionPipeline';
import { NaturalLanguageProcessor } from './NaturalLanguageProcessor';
import { PersonalizationEngine } from './PersonalizationEngine';

interface MLModelStatus {
  name: string;
  type: 'computer_vision' | 'nlp' | 'recommendation' | 'classification';
  status: 'active' | 'training' | 'idle' | 'error';
  accuracy: number;
  lastTrained: string;
  requests: number;
  responseTime: number;
}

interface SystemMetrics {
  totalRequests: number;
  activeModels: number;
  avgResponseTime: number;
  successRate: number;
  gpuUtilization: number;
  memoryUsage: number;
}

export const AIMLDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock ML model statuses
  const modelStatuses: MLModelStatus[] = [
    {
      name: 'Fashion Item Detector',
      type: 'computer_vision',
      status: 'active',
      accuracy: 0.94,
      lastTrained: '2024-01-20',
      requests: 15420,
      responseTime: 230
    },
    {
      name: 'Style Classifier',
      type: 'computer_vision',
      status: 'active',
      accuracy: 0.89,
      lastTrained: '2024-01-18',
      requests: 8760,
      responseTime: 180
    },
    {
      name: 'Trend Predictor',
      type: 'classification',
      status: 'training',
      accuracy: 0.87,
      lastTrained: '2024-01-15',
      requests: 3420,
      responseTime: 150
    },
    {
      name: 'Sentiment Analyzer',
      type: 'nlp',
      status: 'active',
      accuracy: 0.91,
      lastTrained: '2024-01-22',
      requests: 12680,
      responseTime: 95
    },
    {
      name: 'Content Generator',
      type: 'nlp',
      status: 'active',
      accuracy: 0.88,
      lastTrained: '2024-01-19',
      requests: 5940,
      responseTime: 340
    },
    {
      name: 'Personalization Engine',
      type: 'recommendation',
      status: 'active',
      accuracy: 0.82,
      lastTrained: '2024-01-21',
      requests: 9870,
      responseTime: 120
    }
  ];

  // Mock system metrics
  const systemMetrics: SystemMetrics = {
    totalRequests: 56090,
    activeModels: 5,
    avgResponseTime: 186,
    successRate: 0.97,
    gpuUtilization: 73,
    memoryUsage: 68
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-white';
      case 'training': return 'bg-warning text-white';
      case 'idle': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'computer_vision': return <Eye className="h-4 w-4" />;
      case 'nlp': return <MessageSquare className="h-4 w-4" />;
      case 'recommendation': return <Target className="h-4 w-4" />;
      case 'classification': return <BarChart3 className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-success';
    if (accuracy >= 0.8) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI/ML Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="computer-vision">Computer Vision</TabsTrigger>
              <TabsTrigger value="nlp">Natural Language</TabsTrigger>
              <TabsTrigger value="personalization">Personalization</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* System Metrics */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{systemMetrics.totalRequests.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Cpu className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{systemMetrics.activeModels}</div>
                    <p className="text-sm text-muted-foreground">Active Models</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{systemMetrics.avgResponseTime}ms</div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{Math.round(systemMetrics.successRate * 100)}%</div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Resource Usage */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">GPU Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Usage</span>
                        <span>{systemMetrics.gpuUtilization}%</span>
                      </div>
                      <Progress value={systemMetrics.gpuUtilization} />
                      <p className="text-sm text-muted-foreground">
                        Optimal range: 60-80%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Usage</span>
                        <span>{systemMetrics.memoryUsage}%</span>
                      </div>
                      <Progress value={systemMetrics.memoryUsage} />
                      <p className="text-sm text-muted-foreground">
                        16 GB total system memory
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Model Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>ML Models Status</span>
                    <Button variant="outline" size="sm">
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modelStatuses.map((model, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(model.type)}
                          <div>
                            <h4 className="font-semibold">{model.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{model.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <Badge className={getStatusColor(model.status)}>
                              {model.status}
                            </Badge>
                          </div>
                          
                          <div className="text-center">
                            <div className={`font-semibold ${getAccuracyColor(model.accuracy)}`}>
                              {Math.round(model.accuracy * 100)}%
                            </div>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-semibold">{model.requests.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Requests</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-semibold">{model.responseTime}ms</div>
                            <p className="text-xs text-muted-foreground">Avg Time</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="computer-vision" className="mt-6">
              <ComputerVisionPipeline />
            </TabsContent>
            
            <TabsContent value="nlp" className="mt-6">
              <NaturalLanguageProcessor />
            </TabsContent>
            
            <TabsContent value="personalization" className="mt-6">
              <PersonalizationEngine />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};