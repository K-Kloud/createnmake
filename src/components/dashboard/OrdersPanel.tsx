
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useOrdersData } from "@/hooks/useOrdersData";
import { getOrderStatusColor } from "@/utils/orderUtils";
import { OrderItem } from "@/components/dashboard/orders/OrderItem";
import { EmptyOrdersState } from "@/components/dashboard/orders/EmptyOrdersState";
import { LoadingState } from "@/components/dashboard/orders/LoadingState";

export const OrdersPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, isLoading } = useOrdersData(user?.id, 5);

  const handleViewAll = () => {
    navigate("/orders");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
        <Button variant="outline" size="sm" onClick={handleViewAll}>
          View All
        </Button>
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
  );
};
