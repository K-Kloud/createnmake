import { Quote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ManufacturerHeaderProps {
  name: string;
  type: string;
  image: string;
}

export const ManufacturerHeader = ({ name, type, image }: ManufacturerHeaderProps) => {
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleQuoteRequest = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request a quote.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Quote Requested",
      description: `Your quote request has been sent to ${name}. They will contact you shortly.`,
    });
  };

  const handlePayment = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a payment.",
        variant: "destructive",
      });
      return;
    }
    window.open('https://buy.stripe.com/test_6oE4hBawn3AL2MU9AA', '_blank');
  };

  return (
    <CardHeader>
      <div className="flex items-center gap-4">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <CardTitle className="text-xl">{name}</CardTitle>
          <p className="text-sm text-muted-foreground">{type}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleQuoteRequest}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Quote className="w-4 h-4" />
            Request Quote
          </Button>
          <Button 
            onClick={handlePayment}
            className="flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Pay Now
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};