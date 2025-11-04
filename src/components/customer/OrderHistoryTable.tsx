import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, FileText, Star, Search } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceViewer } from './InvoiceViewer';
import { MakerRatingDialog } from './MakerRatingDialog';
import { useNavigate } from 'react-router-dom';
import { getOrderStatusColor } from '@/utils/orderUtils';

export const OrderHistoryTable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<{ orderId: string; orderType: 'artisan' | 'manufacturer' } | null>(null);
  const [selectedRating, setSelectedRating] = useState<{ makerId: string; makerName: string; makerType: 'artisan' | 'manufacturer'; orderId: string } | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['order-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const [artisanResult, manufacturerResult] = await Promise.all([
        supabase
          .from('artisan_quotes')
          .select('*, profiles!artisan_quotes_artisan_id_fkey(username, avatar_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('quote_requests')
          .select('*, manufacturers(business_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (artisanResult.error) throw artisanResult.error;
      if (manufacturerResult.error) throw manufacturerResult.error;

      const allOrders = [
        ...(artisanResult.data || []).map(o => ({
          ...o,
          id: o.id.toString(),
          type: 'artisan' as const,
          maker_name: o.profiles?.username || 'Artisan',
          maker_id: o.artisan_id,
        })),
        ...(manufacturerResult.data || []).map(o => ({
          ...o,
          id: o.id.toString(),
          type: 'manufacturer' as const,
          maker_name: o.manufacturers?.business_name || 'Manufacturer',
          maker_id: o.manufacturer_id,
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return allOrders;
    },
    enabled: !!user?.id,
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.product_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Maker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={`${order.type}-${order.id}`}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{order.maker_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.amount ? `$${order.amount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/orders/${order.type}/${order.id}`)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.amount && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedInvoice({ orderId: order.id, orderType: order.type })}
                              title="View Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedRating({
                                makerId: order.maker_id,
                                makerName: order.maker_name,
                                makerType: order.type,
                                orderId: order.id,
                              })}
                              title="Rate Maker"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInvoice && (
        <InvoiceViewer
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
          orderId={selectedInvoice.orderId}
          orderType={selectedInvoice.orderType}
        />
      )}

      {selectedRating && (
        <MakerRatingDialog
          open={!!selectedRating}
          onOpenChange={(open) => !open && setSelectedRating(null)}
          makerId={selectedRating.makerId}
          makerName={selectedRating.makerName}
          makerType={selectedRating.makerType}
          orderId={selectedRating.orderId}
        />
      )}
    </>
  );
};
