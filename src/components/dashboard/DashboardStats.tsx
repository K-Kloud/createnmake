
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Heart, LayoutGrid, PackageOpen, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStatsProps {
  generatedImagesCount: number;
  productsCount: number;
  ordersCount: number;
  likesCount: number;
}

export const DashboardStats = ({
  generatedImagesCount,
  productsCount,
  ordersCount,
  likesCount
}: DashboardStatsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatsCard
        title="Designs"
        value={generatedImagesCount}
        icon={<LayoutGrid size={16} />}
        onClick={() => navigate("/designs")}
      />
      <StatsCard
        title="Products"
        value={productsCount}
        icon={<PackageOpen size={16} />}
        onClick={() => navigate("/products")}
      />
      <StatsCard
        title="Orders"
        value={ordersCount}
        icon={<ShoppingBag size={16} />}
        onClick={() => navigate("/orders")}
      />
      <StatsCard
        title="Likes"
        value={likesCount}
        icon={<Heart size={16} />}
      />
    </div>
  );
};
