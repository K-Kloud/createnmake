import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const MarketplaceHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold gradient-text rounded-lg">OpenMarket</h2>
      <Button 
        onClick={() => navigate("/marketplace")}
        variant="outline"
      >
        View All
      </Button>
    </div>
  );
};