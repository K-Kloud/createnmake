import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowContext } from '@/types/workflow';

const WorkflowContextObj = createContext<WorkflowContext | undefined>(undefined);

interface WorkflowProviderProps {
  children: ReactNode;
  workflowId?: string;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ 
  children, 
  workflowId 
}) => {
  const workflowHook = useWorkflow(workflowId);

  return (
    <WorkflowContextObj.Provider value={workflowHook}>
      {children}
    </WorkflowContextObj.Provider>
  );
};

export const useWorkflowContext = (): WorkflowContext => {
  const context = useContext(WorkflowContextObj);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
};