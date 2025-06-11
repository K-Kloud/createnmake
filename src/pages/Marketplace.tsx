
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { MarketplaceTabs } from "@/components/marketplace/MarketplaceTabs";
import { FeaturedCollections } from "@/components/marketplace/FeaturedCollections";
import { useTranslation } from "react-i18next";

const Marketplace = () => {
  const { t } = useTranslation(['marketplace', 'navigation']);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text text-center">
            {t('navigation:main.marketplace')}
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            {t('marketplace:title')}
          </p>
        </div>
        <MarketplaceTabs />
        <FeaturedCollections />
        <OpenMarketSection />
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace;
