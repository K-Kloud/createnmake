
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
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
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
