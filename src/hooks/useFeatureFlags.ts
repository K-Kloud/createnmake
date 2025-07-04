import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface FeatureFlag {
  id: string;
  flag_name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_roles: string[];
  conditions: any;
  created_at: string;
  updated_at: string;
}

export const useFeatureFlags = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all feature flags
  const { data: flags, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async (): Promise<FeatureFlag[]> => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_name');

      if (error) throw error;
      return data;
    },
  });

  // Check if feature is enabled
  const isFeatureEnabled = (flagName: string): boolean => {
    const flag = flags?.find(f => f.flag_name === flagName);
    return flag?.is_enabled || false;
  };

  // Create flag
  const createFlag = useMutation({
    mutationFn: async (flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('feature_flags')
        .insert([flag])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast({
        title: 'Feature Flag Created',
        description: 'Feature flag has been created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create feature flag: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update flag
  const updateFlag = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeatureFlag> & { id: string }) => {
      const { data, error } = await supabase
        .from('feature_flags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast({
        title: 'Feature Flag Updated',
        description: 'Feature flag has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update feature flag: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete flag
  const deleteFlag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast({
        title: 'Feature Flag Deleted',
        description: 'Feature flag has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete feature flag: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    flags,
    isLoading,
    isFeatureEnabled,
    createFlag: createFlag.mutate,
    updateFlag: updateFlag.mutate,
    deleteFlag: deleteFlag.mutate,
    isCreating: createFlag.isPending,
    isUpdating: updateFlag.isPending,
    isDeleting: deleteFlag.isPending,
  };
};