import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MakerPayoutSettings } from "@/types/payout";
import { toast } from "sonner";

export const usePayoutSettings = (makerId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['payout-settings', makerId],
    queryFn: async () => {
      if (!makerId) throw new Error('Maker ID is required');
      
      const { data, error } = await supabase
        .from('maker_payout_settings')
        .select('*')
        .eq('maker_id', makerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as MakerPayoutSettings | null;
    },
    enabled: !!makerId,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<MakerPayoutSettings>) => {
      if (!makerId) throw new Error('Maker ID is required');

      const { data, error } = await supabase
        .from('maker_payout_settings')
        .upsert({
          maker_id: makerId,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-settings', makerId] });
      toast.success('Payout settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};
