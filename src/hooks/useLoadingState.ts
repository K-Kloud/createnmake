import React, { useState, useEffect, useCallback } from 'react';
import { useLoadingManager } from '@/providers/LoadingManagerProvider';

interface UseLoadingStateOptions {
  id?: string;
  type?: 'component' | 'data' | 'image' | 'critical' | 'background';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  autoStart?: boolean;
  message?: string;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    id = `loading-${Math.random().toString(36).substr(2, 9)}`,
    type = 'component',
    priority = 'medium',
    autoStart = false,
    message = 'Loading...'
  } = options;

  const { startLoading, updateProgress, finishLoading } = useLoadingManager();
  const [isLoading, setIsLoading] = useState(autoStart);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (autoStart) {
      startLoading(id, type, message, priority);
    }
    return () => {
      if (isLoading) {
        finishLoading(id);
      }
    };
  }, [autoStart, id, type, message, priority, startLoading, finishLoading, isLoading]);

  const start = useCallback((customMessage?: string) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    startLoading(id, type, customMessage || message, priority);
  }, [id, type, message, priority, startLoading]);

  const updateProgressValue = useCallback((value: number) => {
    setProgress(value);
    updateProgress(id, value);
  }, [id, updateProgress]);

  const finish = useCallback((success: boolean = true, errorMessage?: string) => {
    setIsLoading(false);
    if (success) {
      setProgress(100);
    } else if (errorMessage) {
      setError(new Error(errorMessage));
    }
    finishLoading(id);
  }, [id, finishLoading]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
    setError(null);
    finishLoading(id);
  }, [id, finishLoading]);

  return {
    isLoading,
    progress,
    error,
    start,
    updateProgress: updateProgressValue,
    finish,
    reset,
    setProgress: updateProgressValue
  };
};

interface UseAsyncOperationOptions extends UseLoadingStateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
}

export const useAsyncOperation = <T = any>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) => {
  const {
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
    ...loadingOptions
  } = options;

  const loading = useLoadingState(loadingOptions);
  const [data, setData] = useState<T | null>(null);
  const [attempt, setAttempt] = useState(0);

  const execute = useCallback(async (customMessage?: string): Promise<T | null> => {
    loading.start(customMessage);
    setAttempt(0);
    
    const attemptOperation = async (attemptsLeft: number): Promise<T | null> => {
      try {
        setAttempt(prev => prev + 1);
        const result = await operation();
        setData(result);
        loading.finish(true);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Operation failed');
        
        if (attemptsLeft > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptOperation(attemptsLeft - 1);
        } else {
          loading.finish(false, err.message);
          onError?.(err);
          return null;
        }
      }
    };

    return attemptOperation(retries);
  }, [operation, loading, onSuccess, onError, retries, retryDelay]);

  return {
    ...loading,
    data,
    execute,
    attempt
  };
};

interface UseProgressiveLoadingOptions {
  stages: Array<{
    name: string;
    weight: number; // relative weight for progress calculation
    operation: () => Promise<any>;
  }>;
  onStageComplete?: (stageName: string, result: any) => void;
  onAllComplete?: (results: any[]) => void;
  onError?: (error: Error, stageName: string) => void;
}

export const useProgressiveLoading = (options: UseProgressiveLoadingOptions) => {
  const { stages, onStageComplete, onAllComplete, onError } = options;
  const loading = useLoadingState({ type: 'background', priority: 'medium' });
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  const totalWeight = stages.reduce((sum, stage) => sum + stage.weight, 0);

  const execute = useCallback(async () => {
    loading.start('Starting progressive loading...');
    setCurrentStage(null);
    setResults([]);
    setCompletedStages([]);
    
    let accumulatedWeight = 0;
    const stageResults: any[] = [];

    try {
      for (const stage of stages) {
        setCurrentStage(stage.name);
        
        try {
          const result = await stage.operation();
          stageResults.push(result);
          setResults([...stageResults]);
          
          accumulatedWeight += stage.weight;
          const progress = (accumulatedWeight / totalWeight) * 100;
          loading.updateProgress(progress);
          
          setCompletedStages(prev => [...prev, stage.name]);
          onStageComplete?.(stage.name, result);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(`Stage ${stage.name} failed`);
          onError?.(err, stage.name);
          throw err;
        }
      }

      setCurrentStage(null);
      loading.finish(true);
      onAllComplete?.(stageResults);
      return stageResults;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Progressive loading failed');
      loading.finish(false, err.message);
      throw err;
    }
  }, [stages, loading, totalWeight, onStageComplete, onAllComplete, onError]);

  return {
    ...loading,
    currentStage,
    results,
    completedStages,
    execute,
    totalStages: stages.length
  };
};