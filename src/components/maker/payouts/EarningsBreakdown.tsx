import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MakerEarning } from "@/types/payout";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EarningsBreakdownProps {
  earnings: MakerEarning[];
  isLoading: boolean;
}

export const EarningsBreakdown = ({ earnings, isLoading }: EarningsBreakdownProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading earnings...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'on_hold': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {earnings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No earnings recorded yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Order Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Total Earnings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="font-medium">#{earning.order_id}</TableCell>
                    <TableCell>{format(new Date(earning.order_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="capitalize">{earning.order_type}</TableCell>
                    <TableCell className="text-right">
                      ${parseFloat(earning.order_amount.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${parseFloat(earning.commission_amount.toString()).toFixed(2)}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({earning.commission_rate}%)
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {earning.referral_bonus > 0 
                        ? `$${parseFloat(earning.referral_bonus.toString()).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${parseFloat(earning.total_earnings.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(earning.status)}>
                        {earning.status}
                      </Badge>
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
