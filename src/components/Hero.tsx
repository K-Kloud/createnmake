
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveText } from "@/components/ui/responsive-text";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";

export const Hero = () => {
  const { t } = useTranslation('common');
  
  return (
    <section className="relative min-h-[60vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-neon-cyan rounded-full animate-neon-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-neon-purple rounded-full animate-neon-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-neon-green rounded-full animate-neon-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-neon-pulse delay-2000"></div>
      </div>

      <ResponsiveContainer className="relative z-10 text-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-3 py-2 sm:px-4 sm:py-2 mb-6 sm:mb-8 animate-slide-up text-xs sm:text-sm">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
          <span className="font-rajdhani font-medium text-muted-foreground">
            Powered by Advanced AI Technology
          </span>
        </div>

        {/* Main Headline */}
        <ResponsiveText variant="h1" className="hero-text mb-4 sm:mb-6 animate-slide-up delay-200">
          Create Amazing Designs
          <br />
          <span className="accent-text">Instantly</span>
        </ResponsiveText>

        {/* Subtitle */}
        <ResponsiveText 
          variant="body" 
          className="font-rajdhani font-light text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 animate-slide-up delay-300 text-base sm:text-xl md:text-2xl"
        >
          Transform your ideas into stunning visuals with our AI-powered design generator. 
          Connect with skilled artisans and bring your creations to life.
        </ResponsiveText>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-slide-up delay-500 px-4 sm:px-0">
          <Button 
            size="lg" 
            className="neon-button glow-effect group w-full sm:w-auto mobile-touch-target"
            onClick={() => document.querySelector(".image-generator")?.scrollIntoView({
              behavior: "smooth"
            })}
          >
            Start Creating Now
            <Zap className="ml-2 group-hover:animate-neon-pulse" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="glass-card font-rajdhani font-semibold border-white/20 hover:border-accent group w-full sm:w-auto mobile-touch-target"
          >
            Explore Gallery
            <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Stats */}
        <ResponsiveGrid 
          cols={{ default: 3 }} 
          gap="sm" 
          className="mt-12 sm:mt-16 max-w-2xl mx-auto animate-slide-up delay-700"
        >
          <div className="text-center">
            <ResponsiveText variant="h3" className="font-orbitron font-bold gradient-text mb-1 sm:mb-2">
              10K+
            </ResponsiveText>
            <ResponsiveText variant="small" className="font-rajdhani text-muted-foreground">
              Designs Created
            </ResponsiveText>
          </div>
          <div className="text-center">
            <ResponsiveText variant="h3" className="font-orbitron font-bold gradient-text mb-1 sm:mb-2">
              500+
            </ResponsiveText>
            <ResponsiveText variant="small" className="font-rajdhani text-muted-foreground">
              Active Makers
            </ResponsiveText>
          </div>
          <div className="text-center">
            <ResponsiveText variant="h3" className="font-orbitron font-bold gradient-text mb-1 sm:mb-2">
              99%
            </ResponsiveText>
            <ResponsiveText variant="small" className="font-rajdhani text-muted-foreground">
              Satisfaction Rate
            </ResponsiveText>
          </div>
        </ResponsiveGrid>
      </ResponsiveContainer>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-5"></div>
    </section>
  );
};
