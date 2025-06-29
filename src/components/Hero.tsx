
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export const Hero = () => {
  const { t } = useTranslation('common');
  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-neon-cyan rounded-full animate-neon-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-neon-purple rounded-full animate-neon-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-neon-green rounded-full animate-neon-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-neon-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 animate-slide-up">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-rajdhani text-sm font-medium text-muted-foreground">
            Powered by Advanced AI Technology
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-text mb-6 animate-slide-up delay-200">
          Create Amazing Designs
          <br />
          <span className="accent-text">Instantly</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-rajdhani font-light text-muted-foreground max-w-3xl mx-auto mb-8 animate-slide-up delay-300">
          Transform your ideas into stunning visuals with our AI-powered design generator. 
          Connect with skilled artisans and bring your creations to life.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up delay-500">
          <Button 
            size="lg" 
            className="neon-button text-lg px-8 py-4 glow-effect group"
            onClick={() => document.querySelector(".image-generator")?.scrollIntoView({
              behavior: "smooth"
            })}
          >
            Start Creating Now
            <Zap className="ml-2 w-5 h-5 group-hover:animate-neon-pulse" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="glass-card text-lg px-8 py-4 font-rajdhani font-semibold border-white/20 hover:border-accent group"
          >
            Explore Gallery
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-slide-up delay-700">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold gradient-text mb-2">10K+</div>
            <div className="text-sm font-rajdhani text-muted-foreground">Designs Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold gradient-text mb-2">500+</div>
            <div className="text-sm font-rajdhani text-muted-foreground">Active Makers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold gradient-text mb-2">99%</div>
            <div className="text-sm font-rajdhani text-muted-foreground">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-5"></div>
    </section>
  );
};
