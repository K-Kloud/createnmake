import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface GenerationRecord {
  id: string;
  prompt: string;
  itemType: string;
  imageUrl: string;
  referenceImageUrl?: string;
  provider: string;
  settings: {
    aspectRatio: string;
    model: string;
    quality: string;
  };
  metadata: {
    processingTime: number;
    enhancedPrompt?: string;
    confidence?: number;
    tags?: string[];
  };
  rating?: number;
  isFavorite: boolean;
  createdAt: number;
  userId?: string;
}

export const useGenerationHistory = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<GenerationRecord[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const loadLocalHistory = () => {
      try {
        const localHistory = localStorage.getItem('generation-history');
        if (localHistory) {
          const parsed = JSON.parse(localHistory);
          setHistory(parsed);
          setFavorites(parsed.filter((record: GenerationRecord) => record.isFavorite));
        }
      } catch (error) {
        console.error('Error loading local history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocalHistory();
  }, []);

  const saveToLocal = useCallback((records: GenerationRecord[]) => {
    try {
      localStorage.setItem('generation-history', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  const addGeneration = useCallback((generation: Omit<GenerationRecord, 'id' | 'createdAt' | 'userId'>) => {
    const newRecord: GenerationRecord = {
      ...generation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      userId: session?.user?.id
    };

    const updatedHistory = [newRecord, ...history].slice(0, 100); // Keep last 100
    setHistory(updatedHistory);
    saveToLocal(updatedHistory);

    if (newRecord.isFavorite) {
      setFavorites(prev => [newRecord, ...prev]);
    }

    console.log('📝 Added generation to history:', newRecord);
  }, [history, session, saveToLocal]);

  const toggleFavorite = useCallback((id: string) => {
    const updatedHistory = history.map(record => {
      if (record.id === id) {
        return { ...record, isFavorite: !record.isFavorite };
      }
      return record;
    });

    setHistory(updatedHistory);
    setFavorites(updatedHistory.filter(record => record.isFavorite));
    saveToLocal(updatedHistory);

    toast({
      title: "Updated",
      description: "Generation favorite status updated."
    });
  }, [history, saveToLocal, toast]);

  const rateGeneration = useCallback((id: string, rating: number) => {
    const updatedHistory = history.map(record => {
      if (record.id === id) {
        return { ...record, rating };
      }
      return record;
    });

    setHistory(updatedHistory);
    saveToLocal(updatedHistory);

    toast({
      title: "Rated",
      description: `Generation rated ${rating} stars.`
    });
  }, [history, saveToLocal, toast]);

  const deleteGeneration = useCallback((id: string) => {
    const updatedHistory = history.filter(record => record.id !== id);
    setHistory(updatedHistory);
    setFavorites(prev => prev.filter(record => record.id !== id));
    saveToLocal(updatedHistory);

    toast({
      title: "Deleted",
      description: "Generation removed from history."
    });
  }, [history, saveToLocal, toast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setFavorites([]);
    localStorage.removeItem('generation-history');
    
    toast({
      title: "Cleared",
      description: "Generation history cleared."
    });
  }, [toast]);

  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `generation-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "History exported successfully."
    });
  }, [history, toast]);

  const getFilteredHistory = useCallback((
    filters: {
      itemType?: string;
      provider?: string;
      rating?: number;
      dateRange?: { start: number; end: number };
      search?: string;
    }
  ) => {
    return history.filter(record => {
      if (filters.itemType && record.itemType !== filters.itemType) return false;
      if (filters.provider && record.provider !== filters.provider) return false;
      if (filters.rating && (record.rating || 0) < filters.rating) return false;
      if (filters.dateRange) {
        if (record.createdAt < filters.dateRange.start || record.createdAt > filters.dateRange.end) {
          return false;
        }
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!record.prompt.toLowerCase().includes(search) && 
            !record.itemType.toLowerCase().includes(search)) {
          return false;
        }
      }
      return true;
    });
  }, [history]);

  return {
    history,
    favorites,
    isLoading,
    addGeneration,
    toggleFavorite,
    rateGeneration,
    deleteGeneration,
    clearHistory,
    exportHistory,
    getFilteredHistory
  };
};