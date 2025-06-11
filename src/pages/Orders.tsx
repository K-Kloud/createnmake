
import { useAuth } from "@/hooks/useAuth";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { useOrdersData } from "@/hooks/useOrdersData";
import { getOrderStatusColor } from "@/utils/orderUtils";
import { OrderItem } from "@/components/dashboard/orders/OrderItem";
import { EmptyOrdersState } from "@/components/dashboard/orders/EmptyOrdersState";
import { LoadingState } from "@/components/dashboard/orders/LoadingState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Orders = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrdersData(user?.id);

  return (
    <AuthenticatedLayout 
      title="My Orders | Create2Make"
      description="View and manage your orders"
    >
      <PageHeader title="My Orders" />
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders.map((order) => (
                <OrderItem 
                  key={`${order.type}-${order.id}`}
                  order={order}
                  getStatusColor={getOrderStatusColor}
                />
              ))}
            </div>
          ) : (
            <EmptyOrdersState />
          )}
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default Orders;
