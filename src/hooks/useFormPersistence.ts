import { useCallback, useRef, useState } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface UseFormPersistenceOptions {
  key: string;
  debounceDelay?: number;
  storage?: 'localStorage' | 'sessionStorage';
}

interface FormPersistenceReturn<T> {
  data: T | null;
  saveData: (data: T) => void;
  clearData: () => void;
  hasPersistedData: boolean;
}

export const useFormPersistence = <T extends Record<string, any>>(
  options: UseFormPersistenceOptions
): FormPersistenceReturn<T> => {
  const { key, debounceDelay = 500, storage = 'localStorage' } = options;
  const { handleError } = useErrorHandler();
  const [hasPersistedData, setHasPersistedData] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getStorageInstance = useCallback(() => {
    return storage === 'localStorage' ? localStorage : sessionStorage;
  }, [storage]);

  const loadData = useCallback((): T | null => {
    try {
      const stored = getStorageInstance().getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHasPersistedData(true);
        return parsed;
      }
      setHasPersistedData(false);
      return null;
    } catch (error) {
      handleError(error, 'Failed to load persisted form data');
      setHasPersistedData(false);
      return null;
    }
  }, [key, getStorageInstance, handleError]);

  const saveData = useCallback((data: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        getStorageInstance().setItem(key, JSON.stringify(data));
        setHasPersistedData(true);
      } catch (error) {
        handleError(error, 'Failed to persist form data');
      }
    }, debounceDelay);
  }, [key, debounceDelay, getStorageInstance, handleError]);

  const clearData = useCallback(() => {
    try {
      getStorageInstance().removeItem(key);
      setHasPersistedData(false);
    } catch (error) {
      handleError(error, 'Failed to clear persisted form data');
    }
  }, [key, getStorageInstance, handleError]);

  const [data] = useState(() => loadData());

  return {
    data,
    saveData,
    clearData,
    hasPersistedData,
  };
};