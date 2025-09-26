import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export type OrderStatus = 'pending' | 'review' | 'completed' | 'cancelled' | 'shipped' | 'delivered';

interface OrderWorkflowProps {
  orderId: string;
  currentStatus: OrderStatus;
  orderType: 'artisan' | 'manufacturer';
  onStatusUpdate: (newStatus: OrderStatus) => void;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-500', label: 'Pending Review', next: ['review', 'cancelled'] },
  review: { icon: AlertCircle, color: 'bg-purple-500', label: 'Under Review', next: ['completed', 'cancelled'] },
  completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Completed', next: ['shipped'] },
  cancelled: { icon: XCircle, color: 'bg-red-500', label: 'Cancelled', next: [] },
  shipped: { icon: Truck, color: 'bg-indigo-500', label: 'Shipped', next: ['delivered'] },
  delivered: { icon: Package, color: 'bg-green-600', label: 'Delivered', next: [] },
  // Add common database status values as fallbacks
  in_progress: { icon: AlertCircle, color: 'bg-purple-500', label: 'In Progress', next: ['completed', 'cancelled'] },
  unpaid: { icon: Clock, color: 'bg-yellow-500', label: 'Payment Pending', next: ['review', 'cancelled'] }
};

// Helper function to get safe status config
const getStatusConfig = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
};

const statusFlow: OrderStatus[] = ['pending', 'review', 'completed', 'shipped', 'delivered'];

export const OrderWorkflow: React.FC<OrderWorkflowProps> = ({
  orderId,
  currentStatus,
  orderType,
  onStatusUpdate
}) => {
  const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    if (newStatus === currentStatus) {
      toast({
        title: "No changes",
        description: "Status is already set to this value",
        variant: "default"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const tableName = orderType === 'artisan' ? 'artisan_quotes' : 'quote_requests';
      
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (notes.trim()) {
        updateData.admin_notes = notes.trim();
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Trigger notification
      await supabase.functions.invoke('order-status-notifications', {
        body: {
          orderId,
          orderType,
          status: newStatus,
          previousStatus: currentStatus,
          notes: notes.trim(),
          eventType: 'status_change'
        }
      });

      onStatusUpdate(newStatus);
      setNotes('');

      toast({
        title: "Status updated",
        description: `Order status changed to ${getStatusConfig(newStatus).label}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentStepIndex = () => statusFlow.indexOf(currentStatus);
  const getStepStatus = (step: OrderStatus, index: number) => {
    const currentIndex = getCurrentStepIndex();
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <Card className="border-2 border-dashed border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Order Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Progress */}
        <div className="space-y-4">
          <h4 className="font-medium">Progress Timeline</h4>
          <div className="flex items-center justify-between relative">
            {statusFlow.filter(s => s !== 'cancelled').map((step, index) => {
              const config = getStatusConfig(step);
              const StatusIcon = config.icon;
              const stepStatus = getStepStatus(step, index);
              
              return (
                <div key={step} className="flex flex-col items-center space-y-2 relative z-10">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${stepStatus === 'completed' ? 'bg-green-500 text-white' : 
                      stepStatus === 'current' ? config.color + ' text-white' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <Badge 
                    variant={stepStatus === 'current' ? 'default' : stepStatus === 'completed' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {config.label}
                  </Badge>
                </div>
              );
            })}
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(getCurrentStepIndex() / (statusFlow.length - 2)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Update Form */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Update Status</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={(value: OrderStatus) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentStatus}>
                    {getStatusConfig(currentStatus).label} (Current)
                  </SelectItem>
                  {getStatusConfig(currentStatus).next.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusConfig(status).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Update Notes (Optional)</label>
              <Textarea
                placeholder="Add notes about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={handleStatusUpdate}
            disabled={isUpdating || newStatus === currentStatus}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : `Update to ${getStatusConfig(newStatus).label}`}
          </Button>
        </div>

        {/* Current Status Display */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {React.createElement(getStatusConfig(currentStatus).icon, { 
              className: "h-5 w-5" 
            })}
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-muted-foreground">{getStatusConfig(currentStatus).label}</p>
            </div>
          </div>
          <Badge className={`text-white ${getStatusConfig(currentStatus).color}`}>
            {currentStatus.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};