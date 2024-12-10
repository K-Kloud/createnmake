import { Loader2 } from "lucide-react";

export const MarketplaceLoader = () => {
  return (
    <div className="flex justify-center items-center py-16">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};