import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { WelcomeWizard } from "@/components/onboarding/WelcomeWizard";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSignals } from "@/components/home/TrustSignals";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { SocialProof } from "@/components/home/SocialProof";
import { CTASection } from "@/components/home/CTASection";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load heavy components
const ImageGenerator = lazy(() => import("@/components/ImageGenerator").then(module => ({ default: module.ImageGenerator })));
const OpenMarketSection = lazy(() => import("@/components/OpenMarketSection").then(module => ({ default: module.OpenMarketSection })));
const ChatBot = lazy(() => import("@/components/ChatBot").then(module => ({ default: module.ChatBot })));
const FeaturedArtisans = lazy(() => import("@/components/dashboard/FeaturedArtisans").then(module => ({ default: module.FeaturedArtisans })));
const LiveChatWidget = lazy(() => import("@/components/support/LiveChatWidget").then(module => ({ default: module.LiveChatWidget })));

const SectionLoader = () => (
  <div className="h-48 flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

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
    <MainLayout
      seo={{
        title: "OpenTeknologies | AI-Powered Fashion Design & Manufacturing",
        description: "Generate stunning fashion designs with AI and connect with skilled artisans to manufacture your creations. Free to start.",
        ogImage: "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png"
      }}
    >
      <WelcomeWizard />
      <OnboardingChecklist />
      
      {/* Hero Section - Above the fold */}
      <HeroSection />
      
      {/* Trust Signals */}
      <TrustSignals />
      
      {/* AI Generator Section */}
      <section data-section="generator" className="py-24 border-y border-border/50">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 pb-6 border-b border-border/30">
            <div>
              <span className="text-label mb-2 block">DESIGN STUDIO</span>
              <h2 className="text-h2">Generate Your Design</h2>
            </div>
            <p className="text-body text-muted-foreground max-w-sm">
              Describe your vision. AI generates unique fashion concepts in seconds.
            </p>
          </div>
          
          <Suspense fallback={<SectionLoader />}>
            <ImageGenerator />
          </Suspense>
        </div>
      </section>

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Featured Artisans */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <Suspense fallback={<SectionLoader />}>
            <FeaturedArtisans />
          </Suspense>
        </div>
      </section>

      {/* Open Market Preview */}
      <Suspense fallback={<SectionLoader />}>
        <OpenMarketSection />
      </Suspense>

      {/* Social Proof */}
      <SocialProof />

      {/* CTA Section */}
      <CTASection />
      
      {/* Chat widgets */}
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
