
import { Hero } from "@/components/Hero";
import { HeroActions } from "@/components/HeroActions";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useTranslation } from "react-i18next";

// Phase 1: Remove lazy loading temporarily for critical components
import { ImageGenerator } from "@/components/ImageGenerator";
import { OpenMarketSection } from "@/components/OpenMarketSection";

// Keep ChatBot lazy since it's not critical
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })));

const Index = () => {
  console.log('🏠 [INDEX] Index page rendering...');
  const { t } = useTranslation('common');

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
    <MainLayout
      seo={{
        title: "OpenTeknologies | Bring Custom Designs to Life",
        description: "Connect with skilled artisans and manufacturers to bring your custom designs to life with our AI-powered design generator.",
        ogImage: "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png"
      }}
    >
      <div className="py-8 sm:py-16">
        {/* Phase 1: Add error handling for critical components */}
        <div className="image-generator">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                AI Design Generator
              </h2>
              <p className="text-muted-foreground">
                Transform your ideas into stunning visuals instantly
              </p>
            </div>
            <ImageGenerator />
          </div>
        </div>
      </div>

      <Hero />
      
      <div className="py-8 sm:py-16">        
        <div className="mt-8 sm:mt-12 text-center">
          <HeroActions />
        </div>
        
        {/* Phase 1: Add fallback content for marketplace */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Marketplace
            </h2>
            <p className="text-muted-foreground">
              Discover amazing designs from our community
            </p>
          </div>
          <OpenMarketSection />
        </div>
      </div>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </MainLayout>
  );
};

export default Index;
