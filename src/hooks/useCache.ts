
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

export const useCache = () => {
  const queryClient = useQueryClient();

  const getCachedData = useCallback(<T>(key: string[]): T | undefined => {
    return queryClient.getQueryData<T>(key);
  }, [queryClient]);

  const setCachedData = useCallback(<T>(key: string[], data: T) => {
    queryClient.setQueryData(key, data);
  }, [queryClient]);

  const invalidateCache = useCallback((key: string[]) => {
    queryClient.invalidateQueries({ queryKey: key });
  }, [queryClient]);

  const prefetchData = useCallback(async <T>(
    key: string[], 
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ) => {
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: fetcher,
      staleTime: config.staleTime || 5 * 60 * 1000, // 5 minutes default
    });
  }, [queryClient]);

  const clearAllCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    prefetchData,
    clearAllCache
  };
};
