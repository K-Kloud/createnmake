
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderItemProps {
  order: any;
  getStatusColor: (status: string) => string;
}

export const OrderItem = ({ order, getStatusColor }: OrderItemProps) => {
  const navigate = useNavigate();

  return (
    <div 
      key={`${order.type}-${order.id}`} 
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-card/50 cursor-pointer"
      onClick={() => navigate(`/orders/${order.type}/${order.id}`)}
    >
      <div className="flex items-center space-x-3">
        <Package className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{order.product_details?.substring(0, 30) || "Product Order"}</p>
          <p className="text-xs text-muted-foreground">
            Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
    </div>
  );
};
