import { Quote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface ManufacturerHeaderProps {
  name: string;
  type: string;
  image: string;
}

export const ManufacturerHeader = ({ name, type, image }: ManufacturerHeaderProps) => {
  const { toast } = useToast();

  const handleQuoteRequest = () => {
    toast({
      title: "Quote Requested",
      description: `Your quote request has been sent to ${name}. They will contact you shortly.`,
    });
  };

  const handlePayment = () => {
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