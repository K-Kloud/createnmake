
import { Hero } from "@/components/Hero";
import { Suspense, lazy, useEffect } from "react";
import { addStructuredData } from "@/utils/seo";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Palette, Users, ArrowRight } from "lucide-react";

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
        title: "Create2Make | Bring Custom Designs to Life",
        description: "Connect with skilled artisans and manufacturers to bring your custom designs to life with our AI-powered design generator.",
        ogImage: "https://openteknologies.com/lovable-uploads/8373b451-38a1-4ecb-8594-cf0c25ba20c4.png"
      }}
    >
      <Hero />
      
      {/* Partnership Call-to-Action Section */}
      <div className="container px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Join Our Creative Community</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're a skilled artisan or a manufacturer, become part of our platform and connect with creators worldwide.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="glass-card group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">For Manufacturers</CardTitle>
              <CardDescription className="text-base">
                Scale your production by partnering with creators and designers seeking manufacturing services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Connect with global customers</li>
                <li>• Showcase your manufacturing capabilities</li>
                <li>• Streamlined order management</li>
                <li>• Grow your business reach</li>
              </ul>
              <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                <Link to="/join/manufacturer">
                  Join as Manufacturer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">For Artisans</CardTitle>
              <CardDescription className="text-base">
                Share your craft with the world and connect with customers who value handmade quality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Showcase your unique creations</li>
                <li>• Connect with appreciative customers</li>
                <li>• Build your artisan business</li>
                <li>• Preserve traditional crafts</li>
              </ul>
              <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                <Link to="/join/artisan">
                  Join as Artisan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<div className="h-64 w-full flex items-center justify-center">{t('common.loading')}</div>}>
          <div className="image-generator">
            <ImageGenerator />
          </div>
        </Suspense>
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
