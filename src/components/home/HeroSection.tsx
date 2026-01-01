import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Users } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToGenerator = () => {
    document.querySelector('[data-section="generator"]')?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,255,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Floating accent elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[15%] w-2 h-2 bg-primary rounded-full animate-pulse" />
        <div className="absolute top-32 right-[20%] w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-[10%] w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-[10%] w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Fashion Design</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-hero mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="text-foreground">Design. Create.</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent acid-text-glow">
            Manufacture.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Generate stunning fashion designs with AI and connect directly with skilled artisans and manufacturers to bring your vision to life.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            onClick={scrollToGenerator}
            className="w-full sm:w-auto text-lg font-semibold px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 acid-glow hover:acid-glow-strong transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Creating Free
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/marketplace")}
            className="w-full sm:w-auto text-lg font-semibold px-8 py-6 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105"
          >
            Explore Marketplace
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">15K+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Designs Created</div>
          </div>
          <div className="text-center border-x border-border/30">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">800+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Expert Artisans</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">98%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
