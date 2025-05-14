
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageGenerator } from "@/components/ImageGenerator";
import { Footer } from "@/components/Footer";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { ChatBot } from "@/components/ChatBot";
import { useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { SEO } from "@/components/SEO";

const Index = () => {
  // Add structured data for SEO
  useEffect(() => {
    const cleanup = addStructuredData('Organization', {
      "name": "Openteknologies",
      "url": "https://openteknologies.com",
      "logo": "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png",
      "description": "Connect with skilled artisans and manufacturers to bring your custom designs to life.",
      "sameAs": [
        "https://twitter.com/openteknologies",
        "https://facebook.com/openteknologies",
        "https://instagram.com/openteknologies"
      ]
    });
    
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Create2Make | Bring Custom Designs to Life" 
        description="Connect with skilled artisans and manufacturers to bring your custom designs to life with our AI-powered design generator."
        ogImage="https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png"
      />
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
