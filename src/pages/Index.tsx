
import { Hero } from "@/components/Hero";
import { HeroActions } from "@/components/HeroActions";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useTranslation } from "react-i18next";

// Lazy load non-critical components
const ImageGenerator = lazy(() => import("@/components/ImageGenerator").then(module => ({
  default: module.ImageGenerator
})));
const OpenMarketSection = lazy(() => import("@/components/OpenMarketSection").then(module => ({
  default: module.OpenMarketSection
})));
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({
  default: module.ChatBot
})));

const Index = () => {
  const { t } = useTranslation('common');

  // Add structured data for SEO
  useEffect(() => {
    const cleanup = addStructuredData('Organization', {
      "name": "Openteknologies",
      "url": "https://openteknologies.com",
      "logo": "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png",
      "description": "Connect with skilled artisans and manufacturers to bring your custom designs to life.",
      "sameAs": ["https://twitter.com/openteknologies", "https://facebook.com/openteknologies", "https://instagram.com/openteknologies"]
    });
    return cleanup;
  }, []);

  return (
    <MainLayout seo={{
      title: "Create2Make | Bring Custom Designs to Life",
      description: "Connect with skilled artisans and manufacturers to bring your custom designs to life with our AI-powered design generator.",
      ogImage: "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png"
    }}>
      {/* Generator Section */}
      <section className="py-12 bg-background">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          </div>
        }>
          <ImageGenerator />
        </Suspense>
      </section>

      <Hero />
      
      <div className="container px-4 py-16">        
        <div className="mt-12 text-center">
          <HeroActions />
        </div>
        
        <Suspense fallback={<div className="h-32 w-full"></div>}>
          <OpenMarketSection />
        </Suspense>
      </div>
      
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </MainLayout>
  );
};

export default Index;
