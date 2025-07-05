import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Package, Truck, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Mock order data - in real implementation, this would come from your orders table
  const { data: order, isLoading } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');

      // Mock order data - replace with actual Supabase query
      const mockOrder = {
        id: id,
        status: 'in_production',
        created_at: '2024-01-15T10:00:00Z',
        estimated_delivery: '2024-01-25T00:00:00Z',
        items: [
          {
            id: 1,
            title: 'Custom T-Shirt Design',
            image_url: '/placeholder.svg',
            quantity: 2,
            price: 25.00
          }
        ],
        total: 50.00,
        shipping_address: {
          name: 'John Doe',
          address_line_1: '123 Fashion Street',
          city: 'London',
          postal_code: 'SW1A 1AA',
          country: 'United Kingdom'
        },
        tracking_updates: [
          {
            status: 'order_placed',
            timestamp: '2024-01-15T10:00:00Z',
            description: 'Your order has been placed successfully'
          },
          {
            status: 'confirmed',
            timestamp: '2024-01-15T11:30:00Z',
            description: 'Order confirmed by manufacturer'
          },
          {
            status: 'in_production',
            timestamp: '2024-01-16T09:00:00Z',
            description: 'Your items are now being produced'
          }
        ]
      };

      return mockOrder;
    },
    enabled: !!id,
  });

  const getStatusProgress = (status: string) => {
    const statusMap: Record<string, number> = {
      'order_placed': 20,
      'confirmed': 40,
      'in_production': 60,
      'shipped': 80,
      'delivered': 100
    };
    return statusMap[status] || 0;
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'order_placed': <Clock className="h-5 w-5" />,
      'confirmed': <CheckCircle className="h-5 w-5" />,
      'in_production': <Package className="h-5 w-5" />,
      'shipped': <Truck className="h-5 w-5" />,
      'delivered': <CheckCircle className="h-5 w-5 text-green-500" />
    };
    return iconMap[status] || <Clock className="h-5 w-5" />;
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      'order_placed': 'Order Placed',
      'confirmed': 'Confirmed',
      'in_production': 'In Production',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return labelMap[status] || status.replace('_', ' ').toUpperCase();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout
        seo={{
          title: "Order Not Found",
          description: "The order you're looking for could not be found.",
          noIndex: true
        }}
      >
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground">
            The order you're looking for could not be found or you don't have access to it.
          </p>
        </div>
      </MainLayout>
    );
  }

  const orderUrl = `${window.location.origin}/order/${order.id}`;

  return (
    <MainLayout
      seo={{
        title: `Order #${order.id} - Tracking`,
        description: `Track your order #${order.id}. Current status: ${getStatusLabel(order.status)}`,
        canonical: orderUrl,
        noIndex: true // Order pages should not be indexed
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {getStatusLabel(order.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getStatusProgress(order.status)}%
                    </span>
                  </div>
                  <Progress value={getStatusProgress(order.status)} />
                </div>

                <div className="space-y-4">
                  {order.tracking_updates.map((update, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(update.status)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {getStatusLabel(update.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {update.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(update.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          £{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>£{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="font-medium">{order.shipping_address.name}</div>
                  <div>{order.shipping_address.address_line_1}</div>
                  <div>{order.shipping_address.city}</div>
                  <div>{order.shipping_address.postal_code}</div>
                  <div>{order.shipping_address.country}</div>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Delivery */}
            <Card>
              <CardHeader>
                <CardTitle>Estimated Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {new Date(order.estimated_delivery).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  We'll send you tracking information once your order ships.
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
              <Button variant="outline" className="w-full">
                Download Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderTracking;