import { useCallback, useRef, useEffect } from 'react';

interface UseDebounceOptions {
  delay?: number;
  immediate?: boolean;
}

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceOptions = {}
) => {
  const { delay = 300, immediate = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const executeCallback = () => {
        callbackRef.current(...args);
      };

      if (immediate && !timeoutRef.current) {
        executeCallback();
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (!immediate) {
          executeCallback();
        }
      }, delay);
    },
    [delay, immediate]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      callbackRef.current();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedCallback,
    cancel,
    flush,
  };
};