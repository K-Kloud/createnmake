import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  XCircle, 
  RefreshCcw, 
  CreditCard,
  DollarSign
} from 'lucide-react';

interface PaymentStatusIndicatorProps {
  paymentStatus?: string | null;
  amount?: number | null;
  currency?: string;
  showAmount?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({
  paymentStatus,
  amount,
  currency = 'GBP',
  showAmount = true,
  size = 'default'
}) => {
  const getStatusConfig = () => {
    const configs = {
      paid: {
        icon: Check,
        text: 'Paid',
        variant: 'default' as const,
        className: 'bg-green-500 text-white border-green-500',
        description: 'Payment has been completed successfully'
      },
      pending: {
        icon: Clock,
        text: 'Pending',
        variant: 'secondary' as const,
        className: 'bg-yellow-500 text-white border-yellow-500',
        description: 'Payment is being processed'
      },
      unpaid: {
        icon: AlertCircle,
        text: 'Unpaid',
        variant: 'outline' as const,
        className: 'border-orange-300 text-orange-600',
        description: 'Payment is required'
      },
      failed: {
        icon: XCircle,
        text: 'Failed',
        variant: 'destructive' as const,
        className: 'bg-red-500 text-white border-red-500',
        description: 'Payment processing failed'
      },
      refunded: {
        icon: RefreshCcw,
        text: 'Refunded',
        variant: 'outline' as const,
        className: 'bg-gray-500 text-white border-gray-500',
        description: 'Payment has been refunded'
      },
      processing: {
        icon: CreditCard,
        text: 'Processing',
        variant: 'secondary' as const,
        className: 'bg-blue-500 text-white border-blue-500',
        description: 'Payment is currently being processed'
      }
    };

    return configs[paymentStatus as keyof typeof configs] || configs.unpaid;
  };

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const badgeSize = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : '';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={config.variant} 
              className={`${config.className} ${badgeSize} flex items-center gap-1`}
            >
              <Icon className={iconSize} />
              {config.text}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
        
        {showAmount && amount && amount > 0 && (
          <div className="flex items-center gap-1 text-sm font-medium">
            <DollarSign className="w-3 h-3 text-muted-foreground" />
            <span className={paymentStatus === 'paid' ? 'text-green-600' : 'text-foreground'}>
              {formatAmount(amount)}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};