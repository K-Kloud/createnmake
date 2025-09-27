import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMultiStackServices } from '@/hooks/useMultiStackServices';
import { 
  WorkflowExecution, 
  WorkflowStep, 
  WorkflowType,
  WorkflowContext 
} from '@/types/workflow';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface WorkflowOrchestratorProps {
  workflowType?: WorkflowType;
  initialData?: any;
  onWorkflowComplete?: (result: any) => void;
}

export const WorkflowOrchestrator: React.FC<WorkflowOrchestratorProps> = ({
  workflowType = 'custom_design',
  initialData,
  onWorkflowComplete
}) => {
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  const { processWithML, performanceOperation } = useMultiStackServices();

  const workflowSteps: Record<WorkflowType, WorkflowStep[]> = {
    'design_to_manufacturing': [
      'input_processing',
      'design_validation',
      'design_optimization',
      'production_routing',
      'quote_generation',
      'production_execution',
      'quality_control',
      'packaging_shipping'
    ],
    'custom_design': [
      'input_processing',
      'design_generation',
      'design_validation',
      'design_optimization'
    ],
    'bulk_order': [
      'input_processing',
      'production_routing',
      'quote_generation',
      'production_execution',
      'quality_control',
      'packaging_shipping',
      'feedback_collection'
    ]
  };

  const startWorkflow = useCallback(async (type: WorkflowType, inputData: any) => {
    setIsExecuting(true);
    try {
      const workflowId = `workflow_${Date.now()}`;
      const newWorkflow: WorkflowExecution = {
        id: workflowId,
        userId: 'current_user', // Replace with actual user ID
        workflowType: type,
        currentStep: workflowSteps[type][0],
        status: 'active',
        inputData,
        stepHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          priority: 'medium',
          estimatedDuration: estimateWorkflowDuration(type),
          totalCost: 0
        }
      };

      setWorkflows(prev => [...prev, newWorkflow]);
      setSelectedWorkflow(newWorkflow);

      // Start processing the first step
      await processWorkflowStep(newWorkflow, inputData);

      toast({
        title: "Workflow Started",
        description: `${type} workflow initiated successfully`,
      });
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast({
        title: "Workflow Error",
        description: "Failed to start workflow",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [workflowSteps, toast]);

  const processWorkflowStep = async (workflow: WorkflowExecution, stepData: any) => {
    const currentStepIndex = workflowSteps[workflow.workflowType].indexOf(workflow.currentStep);
    const step = workflow.currentStep;

    try {
      const startTime = Date.now();
      let result: any;

      // Process different step types
      switch (step) {
        case 'input_processing':
          result = await processWithML({
            data: stepData,
            options: { validate: true, enhance: true }
          });
          break;

        case 'design_generation':
          result = await processWithML({
            data: stepData,
            options: { model: 'advanced', quality: 'high' }
          });
          break;

        case 'design_validation':
          result = await performanceOperation('validate_design', stepData);
          break;

        case 'design_optimization':
          result = await processWithML({
            data: stepData,
            options: { optimize_for: 'manufacturing' }
          });
          break;

        case 'production_routing':
          result = await performanceOperation('route_production', stepData);
          break;

        case 'quote_generation':
          result = await performanceOperation('generate_quote', stepData);
          break;

        default:
          result = { status: 'completed', data: stepData };
      }

      const duration = Date.now() - startTime;
      const qualityScore = calculateQualityScore(result);

      // Update workflow with step completion
      const updatedWorkflow: WorkflowExecution = {
        ...workflow,
        currentStep: workflowSteps[workflow.workflowType][currentStepIndex + 1] || workflow.currentStep,
        status: currentStepIndex + 1 >= workflowSteps[workflow.workflowType].length ? 'completed' : 'active',
        stepHistory: [
          ...workflow.stepHistory,
          {
            stepName: step,
            status: 'completed',
            startedAt: new Date(Date.now() - duration).toISOString(),
            completedAt: new Date().toISOString(),
            duration,
            outputData: result,
            qualityScore
          }
        ],
        updatedAt: new Date().toISOString()
      };

      setWorkflows(prev => prev.map(w => w.id === workflow.id ? updatedWorkflow : w));
      setSelectedWorkflow(updatedWorkflow);

      // Continue to next step if workflow not complete
      if (updatedWorkflow.status === 'active') {
        setTimeout(() => processWorkflowStep(updatedWorkflow, result.data || result), 1000);
      } else if (updatedWorkflow.status === 'completed') {
        onWorkflowComplete?.(updatedWorkflow);
        toast({
          title: "Workflow Complete",
          description: `${workflow.workflowType} workflow completed successfully`,
        });
      }

    } catch (error) {
      console.error(`Error processing step ${step}:`, error);
      
      const failedWorkflow: WorkflowExecution = {
        ...workflow,
        status: 'failed',
        stepHistory: [
          ...workflow.stepHistory,
          {
            stepName: step,
            status: 'failed',
            startedAt: new Date().toISOString(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            duration: 0
          }
        ],
        updatedAt: new Date().toISOString()
      };

      setWorkflows(prev => prev.map(w => w.id === workflow.id ? failedWorkflow : w));
      setSelectedWorkflow(failedWorkflow);

      toast({
        title: "Step Failed",
        description: `Failed to process ${step}`,
        variant: "destructive",
      });
    }
  };

  const pauseWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'paused' as const } : w
    ));
    toast({
      title: "Workflow Paused",
      description: "Workflow execution paused",
    });
  };

  const resumeWorkflow = (workflow: WorkflowExecution) => {
    const updatedWorkflow = { ...workflow, status: 'active' as const };
    setWorkflows(prev => prev.map(w => w.id === workflow.id ? updatedWorkflow : w));
    
    const lastStep = workflow.stepHistory[workflow.stepHistory.length - 1];
    processWorkflowStep(updatedWorkflow, lastStep?.outputData);
  };

  const cancelWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'cancelled' as const } : w
    ));
    toast({
      title: "Workflow Cancelled",
      description: "Workflow execution cancelled",
    });
  };

  const estimateWorkflowDuration = (type: WorkflowType): number => {
    const baseTimes = {
      'design_to_manufacturing': 30,
      'custom_design': 10,
      'bulk_order': 45
    };
    return baseTimes[type] || 15;
  };

  const calculateQualityScore = (result: any): number => {
    // Simplified quality scoring
    if (result.error) return 0;
    if (result.confidence) return result.confidence * 100;
    return Math.random() * 20 + 80; // Mock score between 80-100
  };

  const getStepProgress = (workflow: WorkflowExecution): number => {
    const totalSteps = workflowSteps[workflow.workflowType].length;
    const completedSteps = workflow.stepHistory.filter(s => s.status === 'completed').length;
    return (completedSteps / totalSteps) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Workflow Orchestrator</h2>
          <p className="text-muted-foreground">Manage and monitor AI-powered workflows</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => startWorkflow('custom_design', initialData || {})}
            disabled={isExecuting}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Custom Design
          </Button>
          <Button
            variant="outline"
            onClick={() => startWorkflow('design_to_manufacturing', initialData || {})}
            disabled={isExecuting}
          >
            <Play className="w-4 h-4 mr-2" />
            Design to Manufacturing
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {workflows.filter(w => w.status === 'active' || w.status === 'paused').map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedWorkflow(workflow)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workflow.workflowType.replace('_', ' ')}</CardTitle>
                      <CardDescription>
                        Started {new Date(workflow.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <div className="flex gap-1">
                        {workflow.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            pauseWorkflow(workflow.id);
                          }}>
                            <Pause className="w-3 h-3" />
                          </Button>
                        )}
                        {workflow.status === 'paused' && (
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                            resumeWorkflow(workflow);
                          }}>
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          cancelWorkflow(workflow.id);
                        }}>
                          <Square className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(getStepProgress(workflow))}%</span>
                      </div>
                      <Progress value={getStepProgress(workflow)} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current Step: {workflow.currentStep.replace('_', ' ')}</span>
                      <span>Steps: {workflow.stepHistory.length}/{workflowSteps[workflow.workflowType].length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {workflows.filter(w => w.status === 'completed').map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedWorkflow(workflow)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workflow.workflowType.replace('_', ' ')}</CardTitle>
                      <CardDescription>
                        Completed {new Date(workflow.updatedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Duration: {workflow.metadata?.estimatedDuration}min • 
                    Quality Score: {Math.round(workflow.stepHistory.reduce((acc, step) => 
                      acc + (step.qualityScore || 0), 0) / workflow.stepHistory.length)}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedWorkflow(workflow)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workflow.workflowType.replace('_', ' ')}</CardTitle>
                      <CardDescription>
                        {new Date(workflow.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Panel */}
      {selectedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details: {selectedWorkflow.workflowType.replace('_', ' ')}</CardTitle>
            <CardDescription>Step-by-step execution details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowSteps[selectedWorkflow.workflowType].map((stepName, index) => {
                const stepData = selectedWorkflow.stepHistory.find(s => s.stepName === stepName);
                const isCurrent = selectedWorkflow.currentStep === stepName;
                const isCompleted = stepData?.status === 'completed';
                const isFailed = stepData?.status === 'failed';

                return (
                  <div key={stepName} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      {getStepIcon(stepData?.status || (isCurrent ? 'in_progress' : 'pending'))}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{stepName.replace('_', ' ')}</div>
                      {stepData && (
                        <div className="text-sm text-muted-foreground">
                          Duration: {stepData.duration ? `${stepData.duration}ms` : 'N/A'}
                          {stepData.qualityScore && ` • Quality: ${Math.round(stepData.qualityScore)}%`}
                        </div>
                      )}
                      {stepData?.errorMessage && (
                        <div className="text-sm text-red-500">{stepData.errorMessage}</div>
                      )}
                    </div>
                    {isCurrent && (
                      <Badge variant="outline" className="animate-pulse">Current</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};