import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface TutorialStep {
  title: string;
  description: string;
  targetElement?: string;
  image?: string;
  action?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Create2Make",
    description: "Let's take a quick tour of the platform and show you how to get started creating amazing fashion designs with AI.",
    image: "/placeholder.svg",
  },
  {
    title: "AI Design Generator",
    description: "Use our powerful AI to generate unique fashion designs. Just describe what you want, and watch the magic happen.",
    targetElement: "#create-button",
  },
  {
    title: "Marketplace",
    description: "Browse designs from creators worldwide, or list your own creations for sale. Filter by style, price, and more.",
    targetElement: "#marketplace-link",
  },
  {
    title: "Your Gallery",
    description: "Access all your generated images, organize them into collections, and manage your portfolio.",
    targetElement: "#gallery-link",
  },
  {
    title: "Connect with Artisans",
    description: "Found a design you love? Connect with skilled artisans who can bring your digital designs to life.",
    targetElement: "#artisan-link",
  },
];

export const InteractiveTutorial = () => {
  const [showTutorial, setShowTutorial] = useLocalStorage("tutorial-completed", false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Only show tutorial for new users
    if (!showTutorial) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    // Highlight target element
    const step = tutorialSteps[currentStep];
    if (step.targetElement) {
      const element = document.querySelector<HTMLElement>(step.targetElement);
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("tutorial-highlight");
      }
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove("tutorial-highlight");
      }
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const step = tutorialSteps[currentStep];
      if (step.action) step.action();
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setShowTutorial(false);
    if (highlightedElement) {
      highlightedElement.classList.remove("tutorial-highlight");
    }
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];

  if (showTutorial === false) return null;

  return (
    <>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent
          className="border-ghost-white/20 bg-void-black/95 backdrop-blur-xl max-w-lg"
          aria-labelledby="tutorial-title"
          aria-describedby="tutorial-description"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-acid-lime" aria-hidden="true" />
                <DialogTitle id="tutorial-title" className="font-mono uppercase tracking-widest text-ghost-white">
                  TUTORIAL
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-slate-400 hover:text-ghost-white"
                aria-label="Close tutorial"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="mt-4" aria-label={`Tutorial progress: ${Math.round(progress)}%`} />
          </DialogHeader>

          <div className="space-y-6 py-6" role="region" aria-live="polite">
            {step.image && (
              <div className="aspect-video rounded-none border border-ghost-white/10 overflow-hidden bg-void-black">
                <img src={step.image} alt="" className="w-full h-full object-cover" aria-hidden="true" />
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-ghost-white">{step.title}</h3>
              <p id="tutorial-description" className="text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-ghost-white/10">
            <div className="text-sm text-slate-400 font-mono">
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-ghost-white/20 hover:bg-ghost-white/5"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-acid-lime text-void-black hover:bg-acid-lime/90"
                aria-label={currentStep < tutorialSteps.length - 1 ? "Next step" : "Finish tutorial"}
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 999;
          box-shadow: 0 0 0 4px rgba(212, 255, 0, 0.3), 0 0 20px 8px rgba(212, 255, 0, 0.2);
          animation: pulse-highlight 2s infinite;
        }

        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(212, 255, 0, 0.3), 0 0 20px 8px rgba(212, 255, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(212, 255, 0, 0.4), 0 0 30px 12px rgba(212, 255, 0, 0.3);
          }
        }

        body.keyboard-nav *:focus {
          outline: 2px solid #D4FF00;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};
