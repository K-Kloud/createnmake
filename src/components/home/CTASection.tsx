import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(212,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,255,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="container px-4 mx-auto max-w-4xl relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Free to Start</span>
          </div>

          <h2 className="text-h1 mb-6">
            Ready to Bring Your
            <br />
            <span className="text-primary">Designs to Life?</span>
          </h2>

          <p className="text-body-large text-muted-foreground max-w-xl mx-auto mb-10">
            Join thousands of creators already using our platform. Start generating designs in seconds — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg font-semibold px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 acid-glow transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="text-lg font-semibold px-8 py-6 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
