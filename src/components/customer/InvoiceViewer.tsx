import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface InvoiceViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderType: 'artisan' | 'manufacturer';
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  invoice_data: any;
}

export const InvoiceViewer = ({
  open,
  onOpenChange,
  orderId,
  orderType,
}: InvoiceViewerProps) => {
  const { user } = useAuth();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', orderId, orderType],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('order_invoices')
        .select('*')
        .eq('order_id', orderId)
        .eq('order_type', orderType)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Invoice | null;
    },
    enabled: open && !!user?.id,
  });

  const downloadInvoice = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(24);
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 40);
    doc.text(`Date: ${format(new Date(invoice.issued_at), 'MMM dd, yyyy')}`, 20, 46);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 52);
    
    if (invoice.due_at) {
      doc.text(`Due: ${format(new Date(invoice.due_at), 'MMM dd, yyyy')}`, 20, 58);
    }
    
    // Line items
    doc.setFontSize(12);
    doc.text('Items', 20, 75);
    doc.line(20, 77, pageWidth - 20, 77);
    
    let y = 85;
    const items = invoice.invoice_data?.items || [];
    items.forEach((item: any) => {
      doc.setFontSize(10);
      doc.text(item.description || 'Order Item', 20, y);
      doc.text(`${invoice.currency} ${item.amount?.toFixed(2) || '0.00'}`, pageWidth - 40, y, { align: 'right' });
      y += 6;
    });
    
    // Totals
    y += 10;
    doc.line(20, y, pageWidth - 20, y);
    y += 8;
    
    doc.text('Subtotal:', 20, y);
    doc.text(`${invoice.currency} ${invoice.amount.toFixed(2)}`, pageWidth - 40, y, { align: 'right' });
    y += 6;
    
    if (invoice.tax_amount > 0) {
      doc.text('Tax:', 20, y);
      doc.text(`${invoice.currency} ${invoice.tax_amount.toFixed(2)}`, pageWidth - 40, y, { align: 'right' });
      y += 6;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 20, y);
    doc.text(`${invoice.currency} ${invoice.total_amount.toFixed(2)}`, pageWidth - 40, y, { align: 'right' });
    
    // Save PDF
    doc.save(`invoice-${invoice.invoice_number}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500';
      case 'sent':
        return 'bg-blue-500/10 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : invoice ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="text-xl font-bold">{invoice.invoice_number}</p>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Issued Date</p>
                  <p className="font-medium">
                    {format(new Date(invoice.issued_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                {invoice.due_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {format(new Date(invoice.due_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {invoice.paid_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Date</p>
                    <p className="font-medium">
                      {format(new Date(invoice.paid_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Order Items</h3>
                {invoice.invoice_data?.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.description || 'Order Item'}</p>
                      {item.details && (
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      )}
                    </div>
                    <p className="font-medium">
                      {invoice.currency} {item.amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">
                    {invoice.currency} {invoice.amount.toFixed(2)}
                  </p>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Tax</p>
                    <p className="font-medium">
                      {invoice.currency} {invoice.tax_amount.toFixed(2)}
                    </p>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <p>Total</p>
                  <p>{invoice.currency} {invoice.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={downloadInvoice}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Invoice not available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
