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
      <Hero />
      <div className="container px-4 py-16 flex-grow">
        <ImageGenerator />
        <OpenMarketSection />
      </div>
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Index;