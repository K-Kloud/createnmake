
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = () => {
  const { t } = useTranslation('common');
  
  return (
    <section className="relative bg-gradient-to-b from-primary-light/5 to-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-light/10 border border-primary-light/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Powered by Advanced AI
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Bring Your Custom Designs
            <br />
            <span className="text-primary">to Life</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Connect with skilled artisans and manufacturers to transform your AI-generated designs into real products.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => document.querySelector(".demo-section")?.scrollIntoView({
                behavior: "smooth"
              })}
            >
              Try Demo Now
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => document.querySelector(".showcase-section")?.scrollIntoView({
                behavior: "smooth"
              })}
            >
              View Gallery
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                10K+
              </div>
              <div className="text-sm text-muted-foreground">
                Designs Created
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                500+
              </div>
              <div className="text-sm text-muted-foreground">
                Active Makers
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                99%
              </div>
              <div className="text-sm text-muted-foreground">
                Satisfaction
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
