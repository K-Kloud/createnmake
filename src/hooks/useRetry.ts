import { useCallback, useRef, useState } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
}

interface UseRetryOptions {
  config?: Partial<RetryConfig>;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  delay: 1000,
  backoffMultiplier: 2,
};

export const useRetry = (options: UseRetryOptions = {}) => {
  const { handleError } = useErrorHandler();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const config = { ...DEFAULT_CONFIG, ...options.config };

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName = 'operation'
  ): Promise<T> => {
    let lastError: Error;
    
    // Cancel any previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      if (abortControllerRef.current.signal.aborted) {
        throw new Error('Operation cancelled');
      }

      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);

        if (attempt > 0) {
          options.onRetry?.(attempt);
          const delay = config.delay * Math.pow(config.backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await operation();
        
        if (attempt > 0) {
          options.onSuccess?.();
        }
        
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === config.maxRetries) {
          handleError(lastError, `Failed to execute ${operationName} after ${config.maxRetries + 1} attempts`);
          options.onFailure?.(lastError);
          setIsRetrying(false);
          setRetryCount(0);
          throw lastError;
        }
      }
    }

    throw lastError!;
  }, [config, handleError, options]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRetrying(false);
      setRetryCount(0);
    }
  }, []);

  return {
    executeWithRetry,
    cancel,
    isRetrying,
    retryCount,
    maxRetries: config.maxRetries,
  };
};