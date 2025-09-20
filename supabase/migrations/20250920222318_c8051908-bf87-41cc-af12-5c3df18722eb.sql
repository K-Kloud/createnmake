-- Create workflow execution tracking table
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL,
  current_step TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  input_data JSONB NOT NULL DEFAULT '{}',
  step_history JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create workflow step outputs table
CREATE TABLE public.workflow_step_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  output_data JSONB NOT NULL DEFAULT '{}',
  quality_score NUMERIC(3,1) CHECK (quality_score >= 0 AND quality_score <= 10),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view their own workflows" 
ON public.workflow_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" 
ON public.workflow_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
ON public.workflow_executions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all workflows" 
ON public.workflow_executions 
FOR SELECT 
USING (is_admin_user());

-- RLS Policies for workflow_step_outputs
CREATE POLICY "Users can view their workflow step outputs" 
ON public.workflow_step_outputs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workflow_executions 
  WHERE id = workflow_step_outputs.workflow_id 
  AND user_id = auth.uid()
));

CREATE POLICY "System can insert step outputs" 
ON public.workflow_step_outputs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all step outputs" 
ON public.workflow_step_outputs 
FOR SELECT 
USING (is_admin_user());

-- Create indexes for better performance
CREATE INDEX idx_workflow_executions_user_id ON public.workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_workflow_executions_type ON public.workflow_executions(workflow_type);
CREATE INDEX idx_workflow_step_outputs_workflow_id ON public.workflow_step_outputs(workflow_id);
CREATE INDEX idx_workflow_step_outputs_step_name ON public.workflow_step_outputs(step_name);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_executions_updated_at
BEFORE UPDATE ON public.workflow_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_workflow_updated_at();