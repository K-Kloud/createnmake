import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkflowProvider, useWorkflowContext } from './WorkflowProvider';
import { WorkflowStep } from './WorkflowStep';
import { WorkflowType } from '@/types/workflow';

const WorkflowControls: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [productType, setProductType] = useState('custom');
  const [requirements, setRequirements] = useState('');
  
  const {
    execution,
    isLoading,
    error,
    startWorkflow,
    advanceStep,
    getStepProgress
  } = useWorkflowContext();

  const handleStartWorkflow = async () => {
    if (!prompt.trim()) return;
    
    await startWorkflow('design_to_manufacturing', {
      prompt: prompt.trim(),
      productType,
      requirements: requirements.trim(),
      timestamp: new Date().toISOString()
    });
  };

  const progressValue = getStepProgress();

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Start AI-Powered Manufacturing Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Design Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want to create (e.g., 'A minimalist wooden coffee table with clean lines')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="productType">Product Type</Label>
            <Input
              id="productType"
              placeholder="e.g., furniture, jewelry, clothing"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">Special Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="Any specific materials, dimensions, or other requirements..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={2}
            />
          </div>
          
          <Button
            onClick={handleStartWorkflow}
            disabled={isLoading || !prompt.trim() || !!execution}
            className="w-full"
          >
            {isLoading ? 'Starting Workflow...' : 'Start Manufacturing Workflow'}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-sm text-destructive">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Progress */}
      {execution && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Workflow Progress</CardTitle>
              <Badge variant={execution.status === 'active' ? 'default' : 'secondary'}>
                {execution.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div><strong>Workflow ID:</strong> {execution.id}</div>
              <div><strong>Type:</strong> {execution.workflowType.replace('_', ' ')}</div>
              <div><strong>Current Step:</strong> {execution.currentStep.replace('_', ' ')}</div>
              <div><strong>Created:</strong> {new Date(execution.createdAt).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Steps */}
      {execution && execution.stepHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Workflow Steps</h3>
          <div className="grid gap-4">
            {execution.stepHistory.map((stepData, index) => {
              const isCurrentStep = stepData.stepName === execution.currentStep;
              const isCompleted = stepData.status === 'completed';
              
              return (
                <WorkflowStep
                  key={`${stepData.stepName}-${index}`}
                  stepData={stepData}
                  isActive={isCurrentStep}
                  isCompleted={isCompleted}
                  canAdvance={isCurrentStep && stepData.status === 'pending'}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Input Data Preview */}
      {execution && (
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(execution.inputData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const WorkflowDemo: React.FC = () => {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI-Powered Manufacturing Workflow</h1>
          <p className="text-muted-foreground">
            Experience the complete design-to-manufacturing pipeline powered by AI
          </p>
        </div>
        
        <Separator />
        
        <WorkflowProvider>
          <WorkflowControls />
        </WorkflowProvider>
      </div>
    </div>
  );
};