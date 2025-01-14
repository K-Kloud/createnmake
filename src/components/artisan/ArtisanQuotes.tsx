import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ArtisanQuotesProps {
  artisanId: string;
}

export const ArtisanQuotes = ({ artisanId }: ArtisanQuotesProps) => {
  const { toast } = useToast();
  const [quoteAmount, setQuoteAmount] = useState<Record<number, string>>({});
  const [quoteResponse, setQuoteResponse] = useState<Record<number, string>>({});

  const { data: quotes, refetch } = useQuery({
    queryKey: ['artisan-quotes', artisanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artisan_quotes')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .eq('artisan_id', artisanId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }
      
      return data;
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ 
      quoteId, 
      amount, 
      status, 
      response 
    }: { 
      quoteId: number; 
      amount: number; 
      status: 'quoted' | 'accepted' | 'rejected'; 
      response?: string;
    }) => {
      const { data, error } = await supabase
        .from('artisan_quotes')
        .update({ 
          amount, 
          status,
          response: response || null
        })
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

  const handleQuoteSubmit = async (quoteId: number, action: 'quote' | 'accept' | 'reject') => {
    const amount = parseFloat(quoteAmount[quoteId]);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const response = quoteResponse[quoteId];
    const status = action === 'quote' ? 'quoted' : action === 'accept' ? 'accepted' : 'rejected';

    await updateQuoteMutation.mutateAsync({ 
      quoteId, 
      amount, 
      status,
      response 
    });

    // Clear the input fields after submission
    setQuoteAmount(prev => ({ ...prev, [quoteId]: '' }));
    setQuoteResponse(prev => ({ ...prev, [quoteId]: '' }));
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
              quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
              quote.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
              quote.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {quote.payment_status === 'paid' ? 'Paid' : quote.status}
            </span>
          </div>
          
          <p className="mt-4">{quote.product_details}</p>
          
          {quote.status === 'pending' && (
            <div className="space-y-4 mt-4">
              <div className="flex gap-2">
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
                  onClick={() => handleQuoteSubmit(quote.id, 'quote')}
                >
                  Submit Quote
                </Button>
              </div>
              <Textarea
                placeholder="Add a response to the customer (optional)"
                value={quoteResponse[quote.id] || ''}
                onChange={(e) => setQuoteResponse(prev => ({
                  ...prev,
                  [quote.id]: e.target.value
                }))}
                className="mt-2"
              />
            </div>
          )}

          {quote.status === 'quoted' && (
            <div className="mt-4 space-y-4">
              <p className="text-sm font-medium">
                Quoted Amount: ${quote.amount}
              </p>
              {quote.response && (
                <p className="text-sm text-muted-foreground">
                  Response: {quote.response}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handleQuoteSubmit(quote.id, 'accept')}
                >
                  Accept Quote
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleQuoteSubmit(quote.id, 'reject')}
                >
                  Reject Quote
                </Button>
              </div>
            </div>
          )}

          {(quote.status === 'accepted' || quote.status === 'rejected') && (
            <div className="mt-4">
              <p className="text-sm font-medium">
                Final Amount: ${quote.amount}
              </p>
              {quote.response && (
                <p className="text-sm text-muted-foreground mt-2">
                  Response: {quote.response}
                </p>
              )}
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