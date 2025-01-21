import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageGenerator } from "@/components/ImageGenerator";
import { Footer } from "@/components/Footer";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20"> {/* Added padding-top to prevent content from hiding under fixed header */}
        <main className="container mx-auto px-4">
          <Hero />
          <div className="py-16">
            <div className="image-generator">
              <ImageGenerator />
            </div>
            <OpenMarketSection />
          </div>
        </main>
      </div>
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Index;