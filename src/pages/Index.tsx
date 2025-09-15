
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedShowcase } from "@/components/FeaturedShowcase";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useTranslation } from "react-i18next";

// Lazy load non-critical components
const ImageGenerator = lazy(() => import("@/components/ImageGenerator").then(module => ({ default: module.ImageGenerator })));
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
      {/* Hero Section */}
      <Hero />

      {/* Demo Section */}
      <section className="py-16 bg-muted/30 demo-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Try Our AI Designer
            </h2>
            <p className="text-lg text-muted-foreground">
              Generate custom designs in seconds with our advanced AI technology
            </p>
          </div>
          
          <Suspense fallback={<div className="h-64 w-full flex items-center justify-center">{t('common.loading')}</div>}>
            <ImageGenerator />
          </Suspense>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />
      
      {/* Featured Showcase */}
      <Suspense fallback={<div className="h-32 w-full bg-muted animate-pulse"></div>}>
        <FeaturedShowcase />
      </Suspense>

      {/* Chat Bot */}
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </MainLayout>
  );
};

export default Index;
