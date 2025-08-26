import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  DollarSign, 
  Package, 
  MessageCircle, 
  Eye,
  Clock,
  MapPin,
  Palette,
  Ruler,
  Hash
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { OrderWorkflow, OrderStatus } from './OrderWorkflow';

interface EnhancedOrder {
  id: string;
  user_id: string | null;
  product_details: string;
  amount?: number | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  type: 'artisan' | 'manufacturer';
  artisan_id?: string | null;
  manufacturer_id?: string | null;
  
  // Enhanced fields
  dimensions?: string | null;
  materials?: string | null;
  colors?: string | null;
  quantity?: number | null;
  timeline_days?: number | null;
  budget_range?: string | null;
  special_requirements?: string | null;
  delivery_address?: string | null;
  contact_preferences?: string | null;
  admin_notes?: string | null;
  generated_image_url?: string | null;
  
  // Calculated fields
  progress_percentage?: number;
  maker_name?: string;
  maker_avatar?: string;
}

interface EnhancedOrderCardProps {
  order: EnhancedOrder;
  onStatusUpdate: (newStatus: OrderStatus) => void;
  isAdmin?: boolean;
  showMakerInfo?: boolean;
}

export const EnhancedOrderCard: React.FC<EnhancedOrderCardProps> = ({ 
  order, 
  onStatusUpdate, 
  isAdmin = false,
  showMakerInfo = false 
}) => {
  const getStatusProgress = (status: OrderStatus): number => {
    const statusMap = {
      'pending': 10,
      'review': 60,
      'completed': 100,
      'cancelled': 0,
      'shipped': 90,
      'delivered': 100
    } as Record<string, number>;
    return statusMap[status] || 0;
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colorMap = {
      'pending': 'bg-yellow-500',
      'review': 'bg-purple-500',
      'completed': 'bg-green-500',
      'cancelled': 'bg-red-500',
      'shipped': 'bg-indigo-500',
      'delivered': 'bg-green-600'
    } as Record<string, string>;
    return colorMap[status] || 'bg-gray-500';
  };

  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order #{order.id.slice(-8)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {order.type === 'artisan' ? 'Artisan' : 'Manufacturer'}
            </Badge>
            <Badge 
              variant="secondary" 
              className={`text-white ${getStatusColor(order.status)}`}
            >
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{getStatusProgress(order.status)}%</span>
          </div>
          <Progress value={getStatusProgress(order.status)} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Visual Preview */}
        {order.generated_image_url && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Design Preview
            </h4>
            <div className="relative bg-muted rounded-lg p-4">
              <img 
                src={order.generated_image_url} 
                alt="Generated design"
                className="max-h-48 w-auto mx-auto rounded-md shadow-md"
              />
            </div>
          </div>
        )}

        {/* Maker Information */}
        {showMakerInfo && (order.maker_name || order.artisan_id || order.manufacturer_id) && (
          <div className="space-y-2">
            <h4 className="font-medium">Maker</h4>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={order.maker_avatar} />
                <AvatarFallback>
                  {order.maker_name?.slice(0, 2).toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{order.maker_name || 'Professional Maker'}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {order.type} • ID: {order.artisan_id || order.manufacturer_id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="space-y-2">
          <h4 className="font-medium">Product Details</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {order.product_details}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {order.quantity && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Hash className="h-3 w-3" />
                Quantity
              </div>
              <p className="text-sm text-muted-foreground">{order.quantity}</p>
            </div>
          )}
          
          {order.dimensions && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Ruler className="h-3 w-3" />
                Dimensions
              </div>
              <p className="text-sm text-muted-foreground">{order.dimensions}</p>
            </div>
          )}
          
          {order.materials && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Package className="h-3 w-3" />
                Materials
              </div>
              <p className="text-sm text-muted-foreground">{order.materials}</p>
            </div>
          )}
          
          {order.colors && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Palette className="h-3 w-3" />
                Colors
              </div>
              <p className="text-sm text-muted-foreground">{order.colors}</p>
            </div>
          )}
        </div>

        {/* Timeline and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {order.timeline_days && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Timeline
              </div>
              <p className="text-sm text-muted-foreground">
                {order.timeline_days} days
              </p>
            </div>
          )}
          
          {order.budget_range && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Budget Range
              </div>
              <p className="text-sm text-muted-foreground">{order.budget_range}</p>
            </div>
          )}
          
          {order.amount && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Quote Amount
              </div>
              <p className="text-lg font-bold text-primary">£{order.amount}</p>
            </div>
          )}
        </div>

        {/* Special Requirements */}
        {order.special_requirements && (
          <div className="space-y-2">
            <h4 className="font-medium">Special Requirements</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {order.special_requirements}
            </p>
          </div>
        )}

        {/* Delivery Information */}
        {order.delivery_address && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </div>
            <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
          </div>
        )}

        {/* Admin Notes */}
        {isAdmin && order.admin_notes && (
          <div className="space-y-2">
            <h4 className="font-medium text-orange-600">Admin Notes</h4>
            <p className="text-sm bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md border border-orange-200 dark:border-orange-800">
              {order.admin_notes}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <div>
              <p className="font-medium">Created</p>
              <p>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <div>
              <p className="font-medium">Updated</p>
              <p>{formatDistanceToNow(new Date(order.updated_at), { addSuffix: true })}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Order Workflow */}
        <OrderWorkflow
          orderId={order.id}
          currentStatus={order.status}
          orderType={order.type}
          onStatusUpdate={onStatusUpdate}
        />

        {/* Communication */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm">
              Add Note
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};