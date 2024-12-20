import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface ManufacturerQuotesProps {
  manufacturerId: string;
  toast: (args: { title: string; description: string }) => void;
}

export const ManufacturerQuotes = ({ manufacturerId, toast }: ManufacturerQuotesProps) => {
  const { data: quoteRequests } = useQuery({
    queryKey: ['quotes', manufacturerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .eq('manufacturer_id', manufacturerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quotes:', error);
        return null;
      }
      return data;
    },
    enabled: !!manufacturerId,
  });

  return (
    <div className="space-y-4">
      {quoteRequests?.map((quote: any) => (
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
              quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {quote.status}
            </span>
          </div>
          <p className="mt-4">{quote.product_details}</p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Quote response sent",
                  description: "The customer will be notified of your response.",
                });
              }}
            >
              Respond
            </Button>
          </div>
        </div>
      ))}
      {(!quoteRequests || quoteRequests.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No quote requests yet.
        </div>
      )}
    </div>
  );
};