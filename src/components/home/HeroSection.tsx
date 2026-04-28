import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToGenerator = () => {
    document.querySelector('[data-section="generator"]')?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-[88vh] flex items-center">
      {/* Subtle acid glow anchored top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]"
      />

      <div className="container relative z-10 px-4 max-w-5xl mx-auto">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-label">PLATFORM ACTIVE · v2.0</span>
        </div>

        {/* Headline */}
        <h1 className="text-hero mb-8 tracking-tight">
          <span className="text-foreground">Design.</span>
          <br />
          <span className="text-foreground">Create.</span>
          <br />
          <span className="text-primary acid-text-glow">Manufacture.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-body-large text-muted-foreground max-w-xl mb-10">
          AI-powered fashion design platform. Generate concepts, connect with
          verified artisans, produce at scale — all in one workflow.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Button
            size="lg"
            onClick={scrollToGenerator}
            className="font-mono text-sm uppercase tracking-wider px-8 h-14"
          >
            Start Designing
            <ArrowRight className="w-4 h-4 ml-3" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/marketplace")}
            className="font-mono text-sm uppercase tracking-wider px-8 h-14"
          >
            <Play className="w-3.5 h-3.5 mr-3" />
            View Marketplace
          </Button>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-border/40">
          <div>
            <div className="text-metadata text-muted-foreground mb-1">DESIGNS GENERATED</div>
            <div className="text-2xl font-mono text-foreground tabular-nums">15,847</div>
          </div>
          <div>
            <div className="text-metadata text-muted-foreground mb-1">VERIFIED ARTISANS</div>
            <div className="text-2xl font-mono text-foreground tabular-nums">824</div>
          </div>
          <div>
            <div className="text-metadata text-muted-foreground mb-1">SATISFACTION</div>
            <div className="text-2xl font-mono text-foreground tabular-nums">98.2%</div>
          </div>
        </div>
      </div>

      {/* Single technical marker */}
      <div className="absolute top-8 left-8 w-8 h-8 border-l border-t border-border/50" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-r border-b border-border/50" />
    </section>
  );
};
