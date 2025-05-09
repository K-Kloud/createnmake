
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { MarketplaceTabs } from "@/components/marketplace/MarketplaceTabs";
import { FeaturedCollections } from "@/components/marketplace/FeaturedCollections";

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-12 flex-grow">
        <MarketplaceTabs />
        <FeaturedCollections />
        <OpenMarketSection />
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace;
