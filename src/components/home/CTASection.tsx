import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="relative border border-border bg-card/40 p-10 md:p-16 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Acid accent corner */}
          <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-primary" />

          <div>
            <span className="text-label mb-3 block">GET STARTED</span>
            <h2 className="text-h1 mb-4">Ready to build something real?</h2>
            <p className="text-body-large text-muted-foreground max-w-xl">
              Start generating designs in seconds. No credit card required. First
              10 generations free.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="font-mono text-sm uppercase tracking-wider px-8 h-14"
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-3" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/subscription")}
              className="font-mono text-sm uppercase tracking-wider px-8 h-14"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
