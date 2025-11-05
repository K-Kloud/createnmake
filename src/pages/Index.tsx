
import { Hero } from "@/components/Hero";
import { HeroActions } from "@/components/HeroActions";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ProductTour } from "@/components/tour/ProductTour";
import { useTranslation } from "react-i18next";

// Lazy load non-critical components
const ImageGenerator = lazy(() => import("@/components/ImageGenerator").then(module => ({ default: module.ImageGenerator })));
const OpenMarketSection = lazy(() => import("@/components/OpenMarketSection").then(module => ({ default: module.OpenMarketSection })));
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })));

const Index = () => {
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
      <ProductTour />
      
      <div className="py-6">
        <Suspense fallback={<div className="h-32 flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>}>
          <ImageGenerator />
        </Suspense>
      </div>

      <Hero />
      
      <div className="py-6">        
        <div className="text-center mb-6">
          <HeroActions />
        </div>
        
        <div data-tour="features-section">
          <Suspense fallback={<div className="h-16"></div>}>
            <OpenMarketSection />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </MainLayout>
  );
};

export default Index;
