import { useQueryClient } from "@tanstack/react-query";

export const useMarketplaceCacheUtils = () => {
  const queryClient = useQueryClient();

  const invalidateMarketplaceCache = () => {
    console.log('🧹 [Cache] Invalidating marketplace cache to force fresh data');
    queryClient.invalidateQueries({ queryKey: ['marketplace-images'] });
  };

  const clearMarketplaceCache = () => {
    console.log('🗑️ [Cache] Clearing marketplace cache completely');
    queryClient.removeQueries({ queryKey: ['marketplace-images'] });
  };

  return {
    invalidateMarketplaceCache,
    clearMarketplaceCache
  };
};