import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw 
} from 'lucide-react';
import { WorkflowStepData, StepStatus, WorkflowStep as WorkflowStepType } from '@/types/workflow';
import { useWorkflowContext } from './WorkflowProvider';

interface WorkflowStepProps {
  stepData: WorkflowStepData;
  isActive?: boolean;
  isCompleted?: boolean;
  canAdvance?: boolean;
}

const stepDisplayNames: Record<WorkflowStepType, string> = {
  input_processing: 'Input Processing',
  design_generation: 'Design Generation',
  design_validation: 'Design Validation',
  design_optimization: 'Design Optimization',
  production_routing: 'Production Routing',
  quote_generation: 'Quote Generation',
  production_execution: 'Production Execution',
  quality_control: 'Quality Control',
  packaging_shipping: 'Packaging & Shipping',
  feedback_collection: 'Feedback Collection'
};

const statusIcons: Record<StepStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  in_progress: <Play className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  failed: <AlertCircle className="h-4 w-4" />,
  skipped: <RotateCcw className="h-4 w-4" />
};

const statusColors: Record<StepStatus, string> = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'default',
  failed: 'destructive',
  skipped: 'outline'
};

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  stepData,
  isActive = false,
  isCompleted = false,
  canAdvance = false
}) => {
  const { advanceStep, isLoading } = useWorkflowContext();

  const handleAdvance = () => {
    if (canAdvance && !isLoading) {
      advanceStep();
    }
  };

  const stepName = stepDisplayNames[stepData.stepName] || stepData.stepName;
  const statusIcon = statusIcons[stepData.status];
  const statusColor = statusColors[stepData.status];

  return (
    <Card className={`transition-all duration-200 ${
      isActive ? 'ring-2 ring-primary shadow-lg' : ''
    } ${isCompleted ? 'bg-muted/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {statusIcon}
            {stepName}
          </CardTitle>
          <Badge variant={statusColor as any}>
            {stepData.status.replace('_', ' ')}
          </Badge>
        </div>
        
        {stepData.duration && (
          <div className="text-sm text-muted-foreground">
            Duration: {Math.round(stepData.duration / 1000)}s
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {stepData.qualityScore && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quality Score</span>
              <span>{stepData.qualityScore}/10</span>
            </div>
            <Progress value={stepData.qualityScore * 10} className="h-2" />
          </div>
        )}

        {stepData.errorMessage && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {stepData.errorMessage}
          </div>
        )}

        {stepData.outputData && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">
              View Output Data
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(stepData.outputData, null, 2)}
            </pre>
          </details>
        )}

        {canAdvance && isActive && (
          <Button 
            onClick={handleAdvance} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Advance Step'}
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          {stepData.startedAt && (
            <div>Started: {new Date(stepData.startedAt).toLocaleString()}</div>
          )}
          {stepData.completedAt && (
            <div>Completed: {new Date(stepData.completedAt).toLocaleString()}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};