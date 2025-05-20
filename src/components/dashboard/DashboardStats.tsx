
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "./StatsCard";
import { Button } from "../ui/button";
import { ImageIcon, ShoppingCartIcon, HeartIcon, PackageIcon, Crown } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export function DashboardStats() {
  const { session, user } = useAuth();
  const { subscriptionStatus } = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    generatedImagesCount,
    likesCount,
    ordersCount,
    productsCount,
  } = useDashboardData(session, user);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["generatedImagesCount"] });
    queryClient.invalidateQueries({ queryKey: ["likesCount"] });
    queryClient.invalidateQueries({ queryKey: ["ordersCount"] });
    queryClient.invalidateQueries({ queryKey: ["productsCount"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Dashboard Overview</h2>
        <Button variant="outline" onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {/* Subscription Status Card */}
      {subscriptionStatus && (
        <div className="bg-muted/30 p-4 rounded-lg border mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              {subscriptionStatus.tier === "free" ? "Free Plan" : `${subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)} Plan`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {subscriptionStatus.images_generated} of {subscriptionStatus.monthly_image_limit} images used this month
            </p>
          </div>
          <Button 
            variant={subscriptionStatus.tier === "free" ? "default" : "outline"}
            onClick={() => navigate("/subscription")}
          >
            {subscriptionStatus.tier === "free" ? "Upgrade" : "Manage Subscription"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Designs Generated"
          value={generatedImagesCount || 0}
          icon={ImageIcon}
          description="Total AI designs created"
          href="/designs"
        />
        <StatsCard
          title="Likes Received"
          value={likesCount || 0}
          icon={HeartIcon}
          description="Across all your designs"
        />
        <StatsCard
          title="Products Listed"
          value={productsCount || 0}
          icon={PackageIcon}
          description="Items available for sale"
        />
        <StatsCard
          title="Orders"
          value={ordersCount || 0}
          icon={ShoppingCartIcon}
          description="Orders placed or received"
          href="/orders"
        />
      </div>
    </div>
  );
}
