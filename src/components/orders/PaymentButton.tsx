import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaymentButtonProps {
  quoteId: string;
  quoteType: 'artisan' | 'manufacturer';
  amount?: number | null;
  paymentStatus?: string | null;
  orderStatus?: string;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  quoteId,
  quoteType,
  amount,
  paymentStatus,
  orderStatus,
  disabled = false,
  size = 'default'
}) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const getPaymentStatusBadge = () => {
    if (!paymentStatus) return null;

    const statusConfig = {
      paid: { variant: 'default' as const, icon: Check, text: 'Paid', className: 'bg-green-500 text-white' },
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Payment Pending', className: 'bg-yellow-500 text-white' },
      unpaid: { variant: 'outline' as const, icon: AlertCircle, text: 'Unpaid', className: '' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, text: 'Payment Failed', className: '' },
      refunded: { variant: 'outline' as const, icon: AlertCircle, text: 'Refunded', className: 'bg-gray-500 text-white' },
    };

    const config = statusConfig[paymentStatus as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const handlePayment = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment",
        variant: "destructive",
      });
      return;
    }

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "This quote does not have a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-quote-payment", {
        body: { 
          quoteId: parseInt(quoteId),
          quoteType 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to create payment session");

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Payment Session Created",
        description: "Redirecting to secure payment page...",
      });

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const canPay = () => {
    return (
      amount && 
      amount > 0 && 
      paymentStatus !== 'paid' && 
      (orderStatus === 'quoted' || orderStatus === 'accepted') &&
      !disabled
    );
  };

  const getButtonText = () => {
    if (isProcessing) return "Processing...";
    if (paymentStatus === 'paid') return "Payment Complete";
    if (paymentStatus === 'pending') return "Payment Pending";
    if (!amount || amount <= 0) return "No Amount Set";
    if (orderStatus !== 'quoted' && orderStatus !== 'accepted') return "Not Ready for Payment";
    return `Pay £${amount}`;
  };

  return (
    <div className="flex items-center gap-2">
      {getPaymentStatusBadge()}
      
      {canPay() && (
        <Button
          onClick={handlePayment}
          disabled={isProcessing || disabled}
          size={size}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          {getButtonText()}
          <ExternalLink className="w-3 h-3" />
        </Button>
      )}
      
      {paymentStatus === 'paid' && (
        <div className="text-sm text-muted-foreground">
          Payment completed successfully
        </div>
      )}
    </div>
  );
};