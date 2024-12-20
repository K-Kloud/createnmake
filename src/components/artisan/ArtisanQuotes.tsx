import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ArtisanQuotesProps {
  artisanId: string;
}

export const ArtisanQuotes = ({ artisanId }: ArtisanQuotesProps) => {
  const { toast } = useToast();
  const [quoteAmount, setQuoteAmount] = useState<Record<number, string>>({});

  const { data: quotes, refetch } = useQuery({
    queryKey: ['artisan-quotes', artisanId],
    queryFn: async () => {
      const { data } = await supabase
        .from('artisan_quotes')
        .select(`
          *,
          profiles:user_id (
            username,
            email
          )
        `)
        .eq('artisan_id', artisanId)
        .order('created_at', { ascending: false });
      return data;
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, amount }: { quoteId: number; amount: number }) => {
      const { data, error } = await supabase
        .from('artisan_quotes')
        .update({ amount, status: 'quoted' })
        .eq('id', quoteId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Quote Updated",
        description: "The quote has been updated successfully.",
      });
    },
  });

  const handleQuoteSubmit = async (quoteId: number) => {
    const amount = parseFloat(quoteAmount[quoteId]);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    await updateQuoteMutation.mutateAsync({ quoteId, amount });
  };

  return (
    <div className="space-y-4">
      {quotes?.map((quote: any) => (
        <div key={quote.id} className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">
                Request from {quote.profiles?.username || 'Anonymous'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm ${
              quote.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
              quote.status === 'quoted' ? 'bg-blue-500/10 text-blue-500' :
              quote.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {quote.payment_status === 'paid' ? 'Paid' : quote.status}
            </span>
          </div>
          <p className="mt-4">{quote.product_details}</p>
          
          {quote.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Input
                type="number"
                placeholder="Quote amount"
                value={quoteAmount[quote.id] || ''}
                onChange={(e) => setQuoteAmount(prev => ({
                  ...prev,
                  [quote.id]: e.target.value
                }))}
                className="max-w-[200px]"
              />
              <Button
                variant="outline"
                onClick={() => handleQuoteSubmit(quote.id)}
              >
                Submit Quote
              </Button>
            </div>
          )}

          {quote.status === 'quoted' && (
            <div className="mt-4">
              <p className="text-sm font-medium">
                Quoted Amount: ${quote.amount}
              </p>
            </div>
          )}
        </div>
      ))}
      {(!quotes || quotes.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No quote requests yet.
        </div>
      )}
    </div>
  );
};