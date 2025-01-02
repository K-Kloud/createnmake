import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageGenerator } from "@/components/ImageGenerator";
import { Footer } from "@/components/Footer";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        <Hero />
        <div className="container px-4 py-16">
          <div className="image-generator">
            <ImageGenerator />
          </div>
          <OpenMarketSection />
        </div>
      </main>
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Index;