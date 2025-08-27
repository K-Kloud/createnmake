import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

interface PayQuoteRequest {
  quoteId: number;
  quoteType: 'artisan' | 'manufacturer';
}

export function useQuotePayment() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const payQuote = useMutation({
    mutationFn: async ({ quoteId, quoteType }: PayQuoteRequest) => {
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase.functions.invoke("create-quote-payment", {
        body: { 
          quoteId,
          quoteType 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to create payment session");

      return data;
    },
    onSuccess: (data) => {
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Payment Session Created",
        description: "Redirecting to secure payment page...",
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['artisan-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturer-orders'] });
    },
    onError: (error) => {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    },
  });

  return {
    payQuote: payQuote.mutate,
    isPaymentLoading: payQuote.isPending,
    paymentError: payQuote.error,
  };
}