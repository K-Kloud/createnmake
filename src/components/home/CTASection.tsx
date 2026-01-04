import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="relative p-12 md:p-16 border border-border/50 bg-card/30">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary -translate-x-px -translate-y-px" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary translate-x-px -translate-y-px" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary -translate-x-px translate-y-px" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary translate-x-px translate-y-px" />

          <div className="text-center">
            <span className="text-label mb-4 block">GET STARTED</span>
            
            <h2 className="text-h1 mb-4">
              Ready to Build?
            </h2>

            <p className="text-body-large text-muted-foreground max-w-md mx-auto mb-8">
              Start generating designs in seconds. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="font-mono text-sm uppercase tracking-wider px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-3" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="font-mono text-sm uppercase tracking-wider px-8 py-6 border-border hover:border-primary/50 hover:bg-card transition-colors"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
