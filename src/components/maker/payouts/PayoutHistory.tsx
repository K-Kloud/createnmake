import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PayoutTransaction } from "@/types/payout";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface PayoutHistoryProps {
  makerId: string;
}

export const PayoutHistory = ({ makerId }: PayoutHistoryProps) => {
  const { data: payouts, isLoading } = useQuery({
    queryKey: ['payout-history', makerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_transactions')
        .select('*')
        .eq('maker_id', makerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PayoutTransaction[];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading payout history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
      </CardHeader>
      <CardContent>
        {!payouts || payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payout history yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Processed Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-xs">
                      {payout.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(payout.scheduled_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {payout.processed_date 
                        ? format(new Date(payout.processed_date), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payout.payment_method.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${parseFloat(payout.amount.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payout.transaction_reference || 'Pending'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payout.status)}
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                      </div>
                      {payout.failure_reason && (
                        <p className="text-xs text-red-500 mt-1">
                          {payout.failure_reason}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
