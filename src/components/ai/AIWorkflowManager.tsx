import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMultiStackServices } from '@/hooks/useMultiStackServices';
import { 
  Brain, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Download,
  Upload,
  Cpu,
  Database,
  Network
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  type: 'content' | 'design' | 'analysis' | 'optimization' | 'recommendation';
  status: 'idle' | 'processing' | 'error' | 'completed';
  description: string;
  capabilities: string[];
  lastUsed?: string;
  totalRuns: number;
  successRate: number;
}

interface AITask {
  id: string;
  agentId: string;
  type: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  error?: string;
  metrics?: {
    processingTime: number;
    qualityScore: number;
    resourceUsage: number;
  };
}

interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  tasks: AITask[];
  status: 'draft' | 'active' | 'completed' | 'failed';
  createdAt: string;
  lastRun?: string;
}

export const AIWorkflowManager: React.FC = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AIWorkflow | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { processWithML, performanceOperation } = useMultiStackServices();

  // Initialize default AI agents
  useEffect(() => {
    const defaultAgents: AIAgent[] = [
      {
        id: 'content-generator',
        name: 'Content Generator',
        type: 'content',
        status: 'idle',
        description: 'Generates marketing copy, product descriptions, and social media content',
        capabilities: ['text generation', 'SEO optimization', 'multi-language', 'tone adaptation'],
        totalRuns: 156,
        successRate: 94.2
      },
      {
        id: 'design-optimizer',
        name: 'Design Optimizer',
        type: 'design',
        status: 'idle',
        description: 'Optimizes designs for manufacturing and aesthetic appeal',
        capabilities: ['pattern analysis', 'color optimization', 'material suggestion', 'cost optimization'],
        totalRuns: 89,
        successRate: 91.8
      },
      {
        id: 'trend-analyzer',
        name: 'Trend Analyzer',
        type: 'analysis',
        status: 'idle',
        description: 'Analyzes fashion trends and market data for insights',
        capabilities: ['trend detection', 'market analysis', 'prediction modeling', 'competitor analysis'],
        totalRuns: 234,
        successRate: 87.5
      },
      {
        id: 'recommendation-engine',
        name: 'Recommendation Engine',
        type: 'recommendation',
        status: 'idle',
        description: 'Provides personalized recommendations based on user behavior',
        capabilities: ['collaborative filtering', 'content-based filtering', 'hybrid recommendations', 'real-time updates'],
        totalRuns: 445,
        successRate: 96.1
      },
      {
        id: 'quality-controller',
        name: 'Quality Controller',
        type: 'analysis',
        status: 'idle',
        description: 'Analyzes design quality and manufacturing feasibility',
        capabilities: ['quality assessment', 'defect detection', 'compliance checking', 'improvement suggestions'],
        totalRuns: 178,
        successRate: 88.9
      }
    ];

    setAgents(defaultAgents);

    // Initialize sample workflows
    const sampleWorkflows: AIWorkflow[] = [
      {
        id: 'product-launch',
        name: 'Product Launch Workflow',
        description: 'Complete workflow for launching a new product from design to marketing',
        agents: ['design-optimizer', 'content-generator', 'trend-analyzer'],
        tasks: [],
        status: 'draft',
        createdAt: new Date().toISOString()
      },
      {
        id: 'design-review',
        name: 'Design Review Process',
        description: 'Automated design review and optimization workflow',
        agents: ['quality-controller', 'design-optimizer', 'recommendation-engine'],
        tasks: [],
        status: 'draft',
        createdAt: new Date().toISOString()
      }
    ];

    setWorkflows(sampleWorkflows);
  }, []);

  const runAgent = useCallback(async (agent: AIAgent, input: any) => {
    setIsProcessing(true);
    
    const task: AITask = {
      id: `task_${Date.now()}`,
      agentId: agent.id,
      type: agent.type,
      input,
      status: 'running',
      startTime: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    
    // Update agent status
    setAgents(prev => prev.map(a => 
      a.id === agent.id ? { ...a, status: 'processing' } : a
    ));

    try {
      let result;
      const startTime = Date.now();

      switch (agent.type) {
        case 'content':
          result = await processWithML({
            image_data: input.image_data || '',
            task_type: 'generation',
            parameters: { 
              model: 'advanced',
              creativity: input.creativity || 0.7,
              language: input.language || 'en'
            }
          });
          break;

        case 'design':
          result = await processWithML({
            image_data: input.image_data || '',
            task_type: 'enhancement',
            parameters: { 
              optimize_for: input.optimize_for || 'manufacturing',
              quality_threshold: input.quality_threshold || 0.8
            }
          });
          break;

        case 'analysis':
          result = await performanceOperation('analyze_data', {
            data: input,
            analysis_type: agent.id.includes('trend') ? 'trend_analysis' : 'quality_analysis'
          });
          break;

        case 'recommendation':
          result = await processWithML({
            image_data: input.image_data || '',
            task_type: 'classification',
            parameters: { 
              algorithm: 'hybrid',
              count: input.count || 10
            }
          });
          break;

        default:
          throw new Error(`Unknown agent type: ${agent.type}`);
      }

      const processingTime = Date.now() - startTime;
      const qualityScore = result.confidence ? result.confidence * 100 : Math.random() * 20 + 80;

      // Update task with results
      const completedTask: AITask = {
        ...task,
        status: 'completed',
        endTime: new Date().toISOString(),
        output: result,
        metrics: {
          processingTime,
          qualityScore,
          resourceUsage: Math.random() * 50 + 25 // Mock resource usage
        }
      };

      setTasks(prev => prev.map(t => t.id === task.id ? completedTask : t));
      
      // Update agent stats
      setAgents(prev => prev.map(a => 
        a.id === agent.id 
          ? { 
              ...a, 
              status: 'completed',
              lastUsed: new Date().toISOString(),
              totalRuns: a.totalRuns + 1,
              successRate: ((a.successRate * a.totalRuns) + 100) / (a.totalRuns + 1)
            } 
          : a
      ));

      toast({
        title: "Agent Completed",
        description: `${agent.name} completed the task successfully`,
      });

    } catch (error) {
      console.error(`Agent ${agent.id} failed:`, error);
      
      const failedTask: AITask = {
        ...task,
        status: 'failed',
        endTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setTasks(prev => prev.map(t => t.id === task.id ? failedTask : t));
      
      setAgents(prev => prev.map(a => 
        a.id === agent.id 
          ? { 
              ...a, 
              status: 'error',
              totalRuns: a.totalRuns + 1,
              successRate: (a.successRate * a.totalRuns) / (a.totalRuns + 1)
            } 
          : a
      ));

      toast({
        title: "Agent Failed",
        description: `${agent.name} encountered an error`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [processWithML, performanceOperation, toast]);

  const runWorkflow = useCallback(async (workflow: AIWorkflow, input: any) => {
    setIsProcessing(true);
    
    try {
      // Update workflow status
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'active', lastRun: new Date().toISOString() } : w
      ));

      let currentInput = input;
      
      // Run agents in sequence
      for (const agentId of workflow.agents) {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
          await runAgent(agent, currentInput);
          
          // Get the output from the last completed task for this agent
          const lastTask = tasks
            .filter(t => t.agentId === agentId && t.status === 'completed')
            .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())[0];
          
          if (lastTask?.output) {
            currentInput = lastTask.output;
          }
        }
      }

      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'completed' } : w
      ));

      toast({
        title: "Workflow Completed",
        description: `${workflow.name} completed successfully`,
      });

    } catch (error) {
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'failed' } : w
      ));

      toast({
        title: "Workflow Failed",
        description: "Workflow encountered an error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [agents, tasks, runAgent, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'processing': case 'running': case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': case 'failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'content': return <Brain className="w-4 h-4" />;
      case 'design': return <Zap className="w-4 h-4" />;
      case 'analysis': return <Database className="w-4 h-4" />;
      case 'recommendation': return <Network className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">AI Workflow Manager</h2>
          <p className="text-muted-foreground">Orchestrate AI agents and automate workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Workflow
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="tasks">Task History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedAgent(agent)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAgentIcon(agent.type)}
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{agent.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Runs</span>
                      <span>{agent.totalRuns}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.capabilities.slice(0, 2).map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.capabilities.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      disabled={isProcessing || agent.status === 'processing'}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Quick run with default input
                        runAgent(agent, { prompt: 'Generate content for a summer fashion collection' });
                      }}
                    >
                      {agent.status === 'processing' ? (
                        <>
                          <Pause className="w-3 h-3 mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Quick Run
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedAgent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getAgentIcon(selectedAgent.type)}
                  {selectedAgent.name} - Detailed Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agent-input">Input Data</Label>
                    <Textarea 
                      id="agent-input"
                      placeholder="Enter input for the agent..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agent-config">Configuration</Label>
                    <Textarea 
                      id="agent-config"
                      placeholder="JSON configuration..."
                      className="mt-1"
                      defaultValue={JSON.stringify({
                        creativity: 0.7,
                        quality_threshold: 0.8,
                        language: 'en'
                      }, null, 2)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    const input = (document.getElementById('agent-input') as HTMLTextAreaElement)?.value;
                    const config = (document.getElementById('agent-config') as HTMLTextAreaElement)?.value;
                    let parsedConfig = {};
                    try {
                      parsedConfig = JSON.parse(config || '{}');
                    } catch (e) {
                      console.error('Invalid JSON config');
                    }
                    runAgent(selectedAgent, { prompt: input, ...parsedConfig });
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Agent
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedWorkflow(workflow)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={isProcessing}
                        onClick={(e) => {
                          e.stopPropagation();
                          runWorkflow(workflow, { prompt: 'Summer fashion collection launch' });
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {workflow.agents.map((agentId) => {
                      const agent = agents.find(a => a.id === agentId);
                      return agent ? (
                        <Badge key={agentId} variant="outline" className="text-xs">
                          {agent.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Created: {new Date(workflow.createdAt).toLocaleString()}
                    {workflow.lastRun && (
                      <> • Last run: {new Date(workflow.lastRun).toLocaleString()}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-2">
            {tasks.slice(-10).reverse().map((task) => {
              const agent = agents.find(a => a.id === task.agentId);
              return (
                <Card key={task.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {agent && getAgentIcon(agent.type)}
                          <span className="font-medium">{agent?.name || 'Unknown Agent'}</span>
                          <Badge className={getStatusColor(task.status)} variant="outline">
                            {task.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Started: {task.startTime ? new Date(task.startTime).toLocaleString() : 'N/A'}
                          {task.endTime && (
                            <> • Completed: {new Date(task.endTime).toLocaleString()}</>
                          )}
                        </div>
                        {task.metrics && (
                          <div className="text-sm text-muted-foreground">
                            Processing: {task.metrics.processingTime}ms • 
                            Quality: {task.metrics.qualityScore.toFixed(1)}% • 
                            Resources: {task.metrics.resourceUsage.toFixed(1)}%
                          </div>
                        )}
                        {task.error && (
                          <div className="text-sm text-red-500 mt-1">{task.error}</div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">
                  {tasks.filter(t => t.status === 'completed').length} completed
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {tasks.length > 0 
                    ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Across all agents
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {tasks.filter(t => t.metrics).length > 0
                    ? (tasks
                        .filter(t => t.metrics)
                        .reduce((acc, t) => acc + t.metrics!.processingTime, 0) 
                      / tasks.filter(t => t.metrics).length).toFixed(0)
                    : 0}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Average response time
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};