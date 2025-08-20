
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { MarketplaceTabs } from "@/components/marketplace/MarketplaceTabs";
import { FeaturedCollections } from "@/components/marketplace/FeaturedCollections";
import { Typography } from "@/components/ui/responsive-text";
import { useTranslation } from "react-i18next";

const Marketplace = () => {
  const { t } = useTranslation(['marketplace', 'navigation']);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-12 flex-grow">
        <div className="mb-8">
          <Typography variant="h1" color="gradient" className="mb-4 text-center">
            {t('navigation:main.marketplace')}
          </Typography>
          <Typography variant="body-large" color="muted" className="text-center mb-8 max-w-2xl mx-auto">
            {t('marketplace:title')}
          </Typography>
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
