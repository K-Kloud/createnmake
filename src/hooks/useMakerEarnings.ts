import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MakerEarning, EarningsSummary } from "@/types/payout";

export const useMakerEarnings = (makerId: string | undefined) => {
  return useQuery({
    queryKey: ['maker-earnings', makerId],
    queryFn: async () => {
      if (!makerId) throw new Error('Maker ID is required');
      
      const { data, error } = await supabase
        .from('maker_earnings')
        .select('*')
        .eq('maker_id', makerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MakerEarning[];
    },
    enabled: !!makerId,
  });
};

export const useMakerEarningsSummary = (makerId: string | undefined) => {
  return useQuery({
    queryKey: ['maker-earnings-summary', makerId],
    queryFn: async () => {
      if (!makerId) throw new Error('Maker ID is required');
      
      const { data: earnings, error } = await supabase
        .from('maker_earnings')
        .select('*')
        .eq('maker_id', makerId);

      if (error) throw error;

      const summary: EarningsSummary = {
        total_earnings: earnings.reduce((sum, e) => sum + parseFloat(e.total_earnings.toString()), 0),
        pending_earnings: earnings
          .filter(e => e.status === 'pending')
          .reduce((sum, e) => sum + parseFloat(e.total_earnings.toString()), 0),
        paid_earnings: earnings
          .filter(e => e.status === 'paid')
          .reduce((sum, e) => sum + parseFloat(e.total_earnings.toString()), 0),
        total_orders: earnings.length,
        average_order_value: earnings.length > 0
          ? earnings.reduce((sum, e) => sum + parseFloat(e.order_amount.toString()), 0) / earnings.length
          : 0,
        commission_rate: earnings[0]?.commission_rate || 85,
      };

      // Get next payout info
      const { data: nextPayout } = await supabase
        .from('payout_transactions')
        .select('amount, scheduled_date')
        .eq('maker_id', makerId)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true })
        .limit(1)
        .single();

      if (nextPayout) {
        summary.next_payout_date = nextPayout.scheduled_date;
        summary.next_payout_amount = parseFloat(nextPayout.amount.toString());
      }

      return summary;
    },
    enabled: !!makerId,
  });
};
