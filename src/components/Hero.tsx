import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { Typography } from "@/components/ui/responsive-text";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { SparkleIcon, MagicWandIcon } from "@/components/ui/custom-icons";

export const Hero = () => {
  const { t } = useTranslation('common');
  
  return (
    <section data-tour="hero-section" className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-[15%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <SparkleIcon className="absolute top-20 left-[15%] w-6 h-6 text-primary/40 animate-pulse" />
        <MagicWandIcon className="absolute top-40 right-[20%] w-5 h-5 text-accent/40 animate-pulse delay-1000" />
        <SparkleIcon className="absolute bottom-40 left-[25%] w-4 h-4 text-primary/30 animate-pulse delay-500" />
      </div>

      <ResponsiveContainer className="relative z-10 text-center">
        {/* Main Headline */}
        <div className="mb-6 sm:mb-8">
          <Typography variant="display" className="mb-3 sm:mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
            Bring Your Creative Vision to Life
          </Typography>

          <Typography variant="body-large" color="muted" className="max-w-2xl mx-auto animate-fade-in delay-100">
            Generate stunning AI-powered designs and connect with master artisans to turn your ideas into reality
          </Typography>
        </div>

        {/* Stats */}
        <ResponsiveGrid cols={{ default: 3 }} gap="md" className="mt-10 sm:mt-14 max-w-3xl mx-auto animate-fade-in delay-200">
          <div className="group text-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
            <Typography variant="h3" className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              15K+
            </Typography>
            <Typography variant="body-small" color="muted" className="font-medium">
              Designs Created
            </Typography>
          </div>
          <div className="group text-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
            <Typography variant="h3" className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              800+
            </Typography>
            <Typography variant="body-small" color="muted" className="font-medium">
              Expert Artisans
            </Typography>
          </div>
          <div className="group text-center p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
            <Typography variant="h3" className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              98%
            </Typography>
            <Typography variant="body-small" color="muted" className="font-medium">
              Client Satisfaction
            </Typography>
          </div>
        </ResponsiveGrid>
      </ResponsiveContainer>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
};