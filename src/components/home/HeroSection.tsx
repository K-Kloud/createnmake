import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToGenerator = () => {
    document.querySelector('[data-section="generator"]')?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      {/* Minimal grid background - already in body, just add subtle accent */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container relative z-10 px-4 max-w-4xl mx-auto">
        {/* Status indicator - minimal, technical */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          <span className="text-label">PLATFORM ACTIVE</span>
        </div>

        {/* Main Headline - clean, impactful */}
        <h1 className="text-hero mb-6">
          <span className="text-foreground">Design.</span>
          <br />
          <span className="text-foreground">Create.</span>
          <br />
          <span className="text-primary">Manufacture.</span>
        </h1>

        {/* Subtitle - concise, no fluff */}
        <p className="text-body-large text-muted-foreground max-w-xl mb-12">
          AI-powered fashion design platform. Generate concepts, connect with artisans, produce at scale.
        </p>

        {/* CTA Buttons - clean, functional */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Button 
            size="lg" 
            onClick={scrollToGenerator}
            className="font-mono text-sm uppercase tracking-wider px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start Designing
            <ArrowRight className="w-4 h-4 ml-3" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/marketplace")}
            className="font-mono text-sm uppercase tracking-wider px-8 py-6 border-border hover:border-primary/50 hover:bg-card transition-colors"
          >
            View Marketplace
          </Button>
        </div>

        {/* Metrics - data-driven, no decoration */}
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <div>
            <div className="text-metadata text-muted-foreground mb-1">DESIGNS</div>
            <div className="text-2xl font-mono text-foreground">15,847</div>
          </div>
          <div>
            <div className="text-metadata text-muted-foreground mb-1">ARTISANS</div>
            <div className="text-2xl font-mono text-foreground">824</div>
          </div>
          <div>
            <div className="text-metadata text-muted-foreground mb-1">SATISFACTION</div>
            <div className="text-2xl font-mono text-foreground">98.2%</div>
          </div>
        </div>
      </div>

      {/* Corner markers - subtle technical detail */}
      <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-border/50" />
      <div className="absolute top-8 right-8 w-8 h-8 border-r border-t border-border/50" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-l border-b border-border/50" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-r border-b border-border/50" />
    </section>
  );
};
