import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { workflowEngine } from '@/services/workflowEngine';
import { WorkflowExecution, WorkflowType, WorkflowStepData } from '@/types/workflow';
import { useToast } from '@/components/ui/use-toast';

export const useWorkflow = (workflowId?: string) => {
  const [execution, setExecution] = useState<WorkflowExecution | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load workflow if workflowId is provided
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const workflow = await workflowEngine.getWorkflow(id);
      setExecution(workflow || undefined);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workflow';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startWorkflow = useCallback(async (type: WorkflowType, inputData: any) => {
    if (!user) {
      setError('User must be authenticated');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const newExecution = await workflowEngine.createWorkflow(user.id, type, inputData);
      setExecution(newExecution);
      
      toast({
        title: "Workflow Started",
        description: `${type.replace('_', ' ')} workflow has been initiated.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start workflow';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const advanceStep = useCallback(async (outputData?: any) => {
    if (!execution) {
      setError('No active workflow');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const updatedExecution = await workflowEngine.advanceWorkflow(execution.id, outputData);
      setExecution(updatedExecution);
      
      const stepName = updatedExecution.currentStep.replace('_', ' ');
      toast({
        title: "Step Completed",
        description: `Advanced to: ${stepName}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to advance workflow';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Step Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [execution, toast]);

  const rollbackStep = useCallback(async () => {
    // TODO: Implement rollback functionality
    toast({
      title: "Not Implemented",
      description: "Rollback functionality coming soon.",
    });
  }, [toast]);

  const pauseWorkflow = useCallback(async () => {
    // TODO: Implement pause functionality
    toast({
      title: "Not Implemented",
      description: "Pause functionality coming soon.",
    });
  }, [toast]);

  const resumeWorkflow = useCallback(async () => {
    // TODO: Implement resume functionality
    toast({
      title: "Not Implemented",
      description: "Resume functionality coming soon.",
    });
  }, [toast]);

  const cancelWorkflow = useCallback(async () => {
    // TODO: Implement cancel functionality
    toast({
      title: "Not Implemented",
      description: "Cancel functionality coming soon.",
    });
  }, [toast]);

  const getCurrentStepData = useCallback((): WorkflowStepData | undefined => {
    if (!execution) return undefined;
    
    return execution.stepHistory.find(step => step.stepName === execution.currentStep);
  }, [execution]);

  const getStepProgress = useCallback((): number => {
    if (!execution) return 0;
    
    const completedSteps = execution.stepHistory.filter(step => step.status === 'completed').length;
    const totalSteps = execution.stepHistory.length;
    
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  }, [execution]);

  return {
    execution,
    isLoading,
    error,
    startWorkflow,
    advanceStep,
    rollbackStep,
    pauseWorkflow,
    resumeWorkflow,
    cancelWorkflow,
    getCurrentStepData,
    getStepProgress,
    loadWorkflow
  };
};