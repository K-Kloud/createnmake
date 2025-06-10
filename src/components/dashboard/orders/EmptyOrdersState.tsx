
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const EmptyOrdersState = () => {
  const { t } = useTranslation(['dashboard', 'navigation']);

  return (
    <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg bg-card/30">
      <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">{t('dashboard:orders.noOrders')}</p>
      <Button asChild variant="link" className="mt-2">
        <Link to="/marketplace">{t('dashboard:orders.exploreMarketplace')}</Link>
      </Button>
    </div>
  );
};
