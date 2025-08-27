import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusIndicator } from "./PaymentStatusIndicator";
import { formatDistanceToNow } from 'date-fns';
import { Receipt, Calendar, Package } from 'lucide-react';

interface PaymentRecord {
  id: string;
  amount: number;
  payment_status: string;
  payment_date: string;
  order_type: 'artisan' | 'manufacturer';
  product_details: string;
}

export const PaymentHistory: React.FC = () => {
  const { user } = useAuth();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch payments from both artisan and manufacturer quotes
      const [artisanResult, manufacturerResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('id, amount, updated_at, product_details, status')
          .eq('user_id', user.id)
          .not('amount', 'is', null)
          .order('updated_at', { ascending: false }),
        
        supabase
          .from('quote_requests')
          .select('id, amount, updated_at, product_details, status')
          .eq('user_id', user.id)
          .not('amount', 'is', null)
          .order('updated_at', { ascending: false })
      ]);

      if (artisanResult.error) throw artisanResult.error;
      if (manufacturerResult.error) throw manufacturerResult.error;

      const allPayments: PaymentRecord[] = [
        ...(artisanResult.data || []).map(p => ({
          id: p.id.toString(),
          amount: p.amount || 0,
          payment_status: p.status === 'paid' ? 'paid' : 'unpaid',
          payment_date: p.updated_at,
          order_type: 'artisan' as const,
          product_details: p.product_details || ''
        })),
        ...(manufacturerResult.data || []).map(p => ({
          id: p.id.toString(),
          amount: p.amount || 0,
          payment_status: p.status === 'paid' ? 'paid' : 'unpaid',
          payment_date: p.updated_at,
          order_type: 'manufacturer' as const,
          product_details: p.product_details || ''
        }))
      ].filter(p => p.amount > 0).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

      return allPayments;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payment history found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div 
              key={payment.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Package className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Order #{payment.id}</p>
                    <Badge variant="outline" className="capitalize">
                      {payment.order_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {payment.product_details}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(payment.payment_date), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <PaymentStatusIndicator 
                  paymentStatus={payment.payment_status}
                  amount={payment.amount}
                  showAmount={true}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};