import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpenMarketSection } from "@/components/OpenMarketSection";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container px-4 py-24 flex-grow">
        <OpenMarketSection />
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;