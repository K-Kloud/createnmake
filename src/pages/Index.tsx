
import { Hero } from "@/components/Hero";
import { HeroActions } from "@/components/HeroActions";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { WelcomeWizard } from "@/components/onboarding/WelcomeWizard";
import { useTranslation } from "react-i18next";

// Lazy load non-critical components
const ImageGenerator = lazy(() => import("@/components/ImageGenerator").then(module => ({ default: module.ImageGenerator })));
const OpenMarketSection = lazy(() => import("@/components/OpenMarketSection").then(module => ({ default: module.OpenMarketSection })));
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })));
const FeaturedArtisans = lazy(() => import("@/components/dashboard/FeaturedArtisans").then(module => ({ default: module.FeaturedArtisans })));
const SuccessStories = lazy(() => import("@/components/dashboard/SuccessStories").then(module => ({ default: module.SuccessStories })));
const LiveChatWidget = lazy(() => import("@/components/support/LiveChatWidget").then(module => ({ default: module.LiveChatWidget })));

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
      <WelcomeWizard />
      <OnboardingChecklist />
      
      <section className="py-8 sm:py-12 bg-gradient-to-b from-background to-card/20">
        <Suspense fallback={<div className="h-32 flex items-center justify-center text-muted-foreground">{t('common.loading')}</div>}>
          <ImageGenerator />
        </Suspense>
      </section>

      <Hero />
      
      <section className="py-8 sm:py-12 bg-gradient-to-b from-transparent to-card/10">        
        <div className="text-center mb-8 sm:mb-12">
          <HeroActions />
        </div>
        
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[hsl(var(--acid-lime))] border-t-transparent rounded-full" /></div>}>
            <FeaturedArtisans />
          </Suspense>
          
          <Suspense fallback={<div className="h-48 flex items-center justify-center mt-8"><div className="animate-spin h-8 w-8 border-2 border-[hsl(var(--acid-lime))] border-t-transparent rounded-full" /></div>}>
            <SuccessStories />
          </Suspense>
        </div>
        
        <div data-tour="features-section" className="mt-12 sm:mt-16">
          <Suspense fallback={<div className="h-16"></div>}>
            <OpenMarketSection />
          </Suspense>
        </div>
      </section>
      
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      
      <Suspense fallback={null}>
        <LiveChatWidget />
      </Suspense>
    </MainLayout>
  );
};

export default Index;
