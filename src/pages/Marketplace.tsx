
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { MarketplaceTabs } from "@/components/marketplace/MarketplaceTabs";
import { FeaturedCollections } from "@/components/marketplace/FeaturedCollections";
import { useTranslation } from "react-i18next";

const Marketplace = () => {
  const { t } = useTranslation(['marketplace', 'navigation']);

  return (
    <PageLayout 
      title="Marketplace | Create2Make"
      description="Discover and purchase unique designs from talented creators"
    >
      <PageHeader 
        title={t('navigation:main.marketplace')}
        subtitle={t('marketplace:title')}
      />
      <MarketplaceTabs />
      <FeaturedCollections />
      <OpenMarketSection />
    </PageLayout>
  );
};

export default Marketplace;
