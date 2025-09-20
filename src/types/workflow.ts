export type WorkflowType = 'design_to_manufacturing' | 'custom_design' | 'bulk_order';

export type WorkflowStep = 
  | 'input_processing'
  | 'design_generation' 
  | 'design_validation'
  | 'design_optimization'
  | 'production_routing'
  | 'quote_generation'
  | 'production_execution'
  | 'quality_control'
  | 'packaging_shipping'
  | 'feedback_collection';

export type WorkflowStatus = 
  | 'active'
  | 'paused' 
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface WorkflowStepData {
  stepName: WorkflowStep;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  outputData?: any;
  errorMessage?: string;
  qualityScore?: number;
}

export interface WorkflowExecution {
  id: string;
  userId: string;
  workflowType: WorkflowType;
  currentStep: WorkflowStep;
  status: WorkflowStatus;
  inputData: any;
  stepHistory: WorkflowStepData[];
  createdAt: string;
  updatedAt: string;
  metadata?: {
    priority?: 'low' | 'medium' | 'high';
    estimatedDuration?: number;
    totalCost?: number;
    customerNotes?: string;
  };
}

export interface WorkflowStepOutput {
  id: string;
  workflowId: string;
  stepName: WorkflowStep;
  outputData: any;
  qualityScore?: number;
  processingTimeMs?: number;
  createdAt: string;
}

export interface WorkflowConfig {
  workflowType: WorkflowType;
  steps: WorkflowStep[];
  stepValidators: Record<WorkflowStep, (data: any) => boolean>;
  stepProcessors: Record<WorkflowStep, (data: any) => Promise<any>>;
  fallbackStrategies: Record<WorkflowStep, () => Promise<any>>;
}

export interface WorkflowContext {
  execution?: WorkflowExecution;
  isLoading: boolean;
  error?: string;
  startWorkflow: (type: WorkflowType, inputData: any) => Promise<void>;
  advanceStep: (outputData?: any) => Promise<void>;
  rollbackStep: () => Promise<void>;
  pauseWorkflow: () => Promise<void>;
  resumeWorkflow: () => Promise<void>;
  cancelWorkflow: () => Promise<void>;
  getCurrentStepData: () => WorkflowStepData | undefined;
  getStepProgress: () => number;
}