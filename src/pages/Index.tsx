
import { Hero } from "@/components/Hero";
import { HeroActions } from "@/components/HeroActions";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useTranslationFallback } from "@/hooks/useTranslationFallback";

// Phase 3: Use progressive loading instead of simple lazy loading
import { ImageGenerator } from "@/components/ImageGenerator";
import { OpenMarketSection } from "@/components/OpenMarketSection";
import { ProgressiveLoader } from "@/components/loading/ProgressiveLoader";
import { lazyWithPreload } from "@/utils/componentPreloader";

// Phase 3: Convert ChatBot to use progressive loading
const ChatBot = lazyWithPreload(
  () => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })),
  'ChatBot',
  'low'
);

const Index = () => {
  console.log('🏠 [INDEX] Index page rendering...');
  const { t, isTranslationReady } = useTranslationFallback('common');

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

  // Phase 2: Show loading state if translations aren't ready
  if (!isTranslationReady) {
    return (
      <MainLayout seo={{ title: "OpenTeknologies | Loading...", description: "Loading application..." }}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      seo={{
        title: "OpenTeknologies | Bring Custom Designs to Life",
        description: "Connect with skilled artisans and manufacturers to bring your custom designs to life with our AI-powered design generator.",
        ogImage: "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png"
      }}
    >
      <div className="py-8 sm:py-16">
        {/* Phase 3: Add progressive loading for critical components */}
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
            <ProgressiveLoader 
              componentName="ImageGenerator"
              timeout={15000}
              retryAttempts={2}
            >
              <ImageGenerator />
            </ProgressiveLoader>
          </div>
        </div>
      </div>

      <Hero />
      
      <div className="py-8 sm:py-16">        
        <div className="mt-8 sm:mt-12 text-center">
          <HeroActions />
        </div>
        
        {/* Phase 3: Add progressive loading for marketplace */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Marketplace
            </h2>
            <p className="text-muted-foreground">
              Discover amazing designs from our community
            </p>
          </div>
          <ProgressiveLoader 
            componentName="OpenMarketSection"
            timeout={12000}
            retryAttempts={3}
          >
            <OpenMarketSection />
          </ProgressiveLoader>
        </div>
      </div>
      
      {/* Phase 3: Keep ChatBot with progressive loading */}
      <ProgressiveLoader 
        componentName="ChatBot"
        timeout={8000}
        retryAttempts={1}
      >
        <ChatBot />
      </ProgressiveLoader>
    </MainLayout>
  );
};

export default Index;
