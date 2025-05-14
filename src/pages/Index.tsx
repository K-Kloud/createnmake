
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { SEO } from "@/components/SEO";

// Lazy load non-critical components
const ImageGenerator = lazy(() => import("@/components/ImageGenerator").then(module => ({ default: module.ImageGenerator })));
const OpenMarketSection = lazy(() => import("@/components/OpenMarketSection").then(module => ({ default: module.OpenMarketSection })));
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));

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
          <Suspense fallback={<div className="h-64 w-full flex items-center justify-center">Loading generator...</div>}>
            <div className="image-generator">
              <ImageGenerator />
            </div>
          </Suspense>
          <Suspense fallback={<div className="h-32 w-full"></div>}>
            <OpenMarketSection />
          </Suspense>
        </div>
      </main>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      <Suspense fallback={<div className="h-20 w-full bg-background"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
