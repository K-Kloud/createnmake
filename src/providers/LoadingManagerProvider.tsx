import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';

interface LoadingState {
  id: string;
  type: 'component' | 'data' | 'image' | 'critical' | 'background';
  message?: string;
  progress?: number;
  startTime: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface LoadingManagerContextType {
  loadingStates: LoadingState[];
  isLoading: boolean;
  criticalLoading: boolean;
  startLoading: (id: string, type: LoadingState['type'], message?: string, priority?: LoadingState['priority']) => void;
  updateProgress: (id: string, progress: number) => void;
  finishLoading: (id: string) => void;
  getLoadingByType: (type: LoadingState['type']) => LoadingState[];
  getTotalProgress: () => number;
}

const LoadingManagerContext = createContext<LoadingManagerContextType | undefined>(undefined);

export const useLoadingManager = () => {
  const context = useContext(LoadingManagerContext);
  if (!context) {
    throw new Error('useLoadingManager must be used within a LoadingManagerProvider');
  }
  return context;
};

interface LoadingManagerProviderProps {
  children: React.ReactNode;
}

export const LoadingManagerProvider: React.FC<LoadingManagerProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);

  const startLoading = useCallback((
    id: string, 
    type: LoadingState['type'], 
    message?: string, 
    priority: LoadingState['priority'] = 'medium'
  ) => {
    setLoadingStates(prev => {
      // Don't duplicate if already loading
      if (prev.some(state => state.id === id)) {
        return prev;
      }
      
      return [...prev, {
        id,
        type,
        message,
        startTime: performance.now(),
        priority,
        progress: 0
      }];
    });
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setLoadingStates(prev => 
      prev.map(state => 
        state.id === id 
          ? { ...state, progress: Math.min(100, Math.max(0, progress)) }
          : state
      )
    );
  }, []);

  const finishLoading = useCallback((id: string) => {
    setLoadingStates(prev => prev.filter(state => state.id !== id));
  }, []);

  const getLoadingByType = useCallback((type: LoadingState['type']) => {
    return loadingStates.filter(state => state.type === type);
  }, [loadingStates]);

  const getTotalProgress = useCallback(() => {
    if (loadingStates.length === 0) return 100;
    
    const totalProgress = loadingStates.reduce((sum, state) => sum + (state.progress || 0), 0);
    return Math.round(totalProgress / loadingStates.length);
  }, [loadingStates]);

  // Clean up stale loading states (older than 30 seconds)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = performance.now();
      setLoadingStates(prev => 
        prev.filter(state => now - state.startTime < 30000)
      );
    }, 5000);

    return () => clearInterval(cleanup);
  }, []);

  const isLoading = loadingStates.length > 0;
  const criticalLoading = loadingStates.some(state => 
    state.priority === 'critical' || state.type === 'critical'
  );

  const value: LoadingManagerContextType = {
    loadingStates,
    isLoading,
    criticalLoading,
    startLoading,
    updateProgress,
    finishLoading,
    getLoadingByType,
    getTotalProgress
  };

  return (
    <LoadingManagerContext.Provider value={value}>
      {children}
    </LoadingManagerContext.Provider>
  );
};