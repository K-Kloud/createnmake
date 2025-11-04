import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PayoutTransaction, PayoutSchedule } from "@/types/payout";
import { format } from "date-fns";
import { toast } from "sonner";
import { Play, Pause, RefreshCw, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AdminPayoutsManager = () => {
  const queryClient = useQueryClient();

  const { data: pendingPayouts } = useQuery({
    queryKey: ['admin-pending-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_transactions')
        .select('*, maker:maker_id(username)')
        .in('status', ['pending', 'processing'])
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as PayoutTransaction[];
    },
  });

  const { data: schedules } = useQuery({
    queryKey: ['payout-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PayoutSchedule[];
    },
  });

  const processPayouts = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-maker-payouts', {
        body: { force: true },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Processed ${data.results.processed} payouts successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payouts'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to process payouts: ${error.message}`);
    },
  });

  const toggleSchedule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('payout_schedules')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Schedule updated successfully');
      queryClient.invalidateQueries({ queryKey: ['payout-schedules'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payout Management</h2>
          <p className="text-muted-foreground">
            Manage maker payouts and schedules
          </p>
        </div>
        <Button onClick={() => processPayouts.mutate()} disabled={processPayouts.isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${processPayouts.isPending ? 'animate-spin' : ''}`} />
          Process All Payouts
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Payouts</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>
                Review and process scheduled payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pendingPayouts || pendingPayouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending payouts
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Maker</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{(payout as any).maker?.username || 'Unknown'}</TableCell>
                        <TableCell className="font-bold">
                          ${parseFloat(payout.amount.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payout.payment_method.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(payout.scheduled_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge>{payout.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Payout Schedules</CardTitle>
              <CardDescription>
                Manage automated payout schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules?.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold">{schedule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Frequency: {schedule.frequency} | 
                        Next run: {schedule.next_run_at 
                          ? format(new Date(schedule.next_run_at), 'MMM dd, yyyy HH:mm')
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={schedule.is_active ? "default" : "secondary"}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSchedule.mutate({ 
                          id: schedule.id, 
                          is_active: schedule.is_active 
                        })}
                      >
                        {schedule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <PayoutTransactionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PayoutTransactionsList = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['all-payout-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_transactions')
        .select('*, maker:maker_id(username)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Maker</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell>{format(new Date(txn.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{(txn as any).maker?.username || 'Unknown'}</TableCell>
                <TableCell>${parseFloat(txn.amount.toString()).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge>{txn.status}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {txn.transaction_reference || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
