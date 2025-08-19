import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  isValid?: boolean;
  isOptional?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  className?: string;
  children: React.ReactNode;
  showProgress?: boolean;
  allowSkipSteps?: boolean;
  validateStep?: (stepIndex: number) => boolean | Promise<boolean>;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  className,
  children,
  showProgress = true,
  allowSkipSteps = false,
  validateStep,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!validateStep) return true;

    setIsValidating(true);
    try {
      const isValid = await validateStep(currentStep);
      setStepValidation(prev => ({ ...prev, [currentStep]: isValid }));
      return isValid;
    } catch (error) {
      setStepValidation(prev => ({ ...prev, [currentStep]: false }));
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [validateStep, currentStep]);

  const handleNext = useCallback(async () => {
    if (isLastStep) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        onComplete?.();
      }
      return;
    }

    if (!allowSkipSteps) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    }

    onStepChange(currentStep + 1);
  }, [isLastStep, allowSkipSteps, validateCurrentStep, onStepChange, currentStep, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [isFirstStep, onStepChange, currentStep]);

  const handleStepClick = useCallback(async (stepIndex: number) => {
    if (stepIndex === currentStep) return;

    if (stepIndex < currentStep || allowSkipSteps) {
      onStepChange(stepIndex);
      return;
    }

    // If trying to jump ahead, validate current step first
    if (stepIndex > currentStep && !allowSkipSteps) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        onStepChange(stepIndex);
      }
    }
  }, [currentStep, allowSkipSteps, onStepChange, validateCurrentStep]);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    if (stepValidation[stepIndex] === false) return 'error';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <span className="text-sm font-medium">{stepIndex + 1}</span>;
    }
  };

  useEffect(() => {
    // Auto-validate current step when it changes
    if (validateStep) {
      validateCurrentStep();
    }
  }, [currentStep, validateCurrentStep, validateStep]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 overflow-x-auto">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = allowSkipSteps || index <= currentStep;
            
            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center space-x-2 cursor-pointer transition-colors',
                  isClickable && 'hover:text-primary',
                  !isClickable && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => isClickable && handleStepClick(index)}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                    status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                    status === 'active' && 'border-primary text-primary bg-primary/10',
                    status === 'error' && 'border-destructive text-destructive bg-destructive/10',
                    status === 'pending' && 'border-muted-foreground text-muted-foreground'
                  )}
                >
                  {getStepIcon(index)}
                </div>
                
                <div className="hidden sm:block">
                  <p className={cn(
                    'text-sm font-medium',
                    status === 'active' && 'text-primary',
                    status === 'error' && 'text-destructive'
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  )}
                  {step.isOptional && (
                    <Badge variant="secondary" className="text-xs mt-1">Optional</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="min-h-[200px]">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isValidating}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={isValidating}
          className="ml-auto"
        >
          {isValidating ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Validating...
            </>
          ) : isLastStep ? (
            'Complete'
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};