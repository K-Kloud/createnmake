import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Store, Wand2, Package, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'welcome_wizard_completed';

const tourSteps: Step[] = [
  {
    target: '[data-tour="hero-section"]',
    content: 'Welcome to OpenTeknologies! This is where your creative journey begins. Let us show you around.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="create-button"]',
    content: 'Click here to start creating unique designs with our AI-powered generator.',
    placement: 'bottom',
  },
  {
    target: '.image-generator',
    content: 'Use this powerful AI tool to generate custom designs. Just describe what you want, and watch the magic happen!',
    placement: 'top',
  },
  {
    target: '[data-tour="features-section"]',
    content: 'Explore the marketplace to discover designs from talented creators and connect with skilled artisans.',
    placement: 'top',
  },
];

export const WelcomeWizard = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!user) return;

    const hasCompletedWizard = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    
    // Show welcome dialog for new users
    if (!hasCompletedWizard) {
      // Delay to ensure page is fully loaded
      setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
    }
  }, [user]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setRunTour(true);
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    if (user) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, 'true');
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      if (user) {
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, 'true');
      }
    }
  };

  return (
    <>
      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-2xl glassmorphism border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Welcome to OpenTeknologies!
            </DialogTitle>
            <DialogDescription className="text-base sm:text-lg text-muted-foreground mt-4">
              We're excited to have you here. Let's take a quick tour to help you get started.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <div className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
              <Wand2 className="w-10 h-10 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">AI Design Generator</h3>
              <p className="text-sm text-muted-foreground">Create stunning custom designs with the power of AI</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all">
              <Store className="w-10 h-10 text-accent mb-3" />
              <h3 className="text-lg font-semibold mb-2">Marketplace</h3>
              <p className="text-sm text-muted-foreground">Browse unique designs from talented creators</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
              <Package className="w-10 h-10 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">Connect with Artisans</h3>
              <p className="text-sm text-muted-foreground">Bring your designs to life with skilled professionals</p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all">
              <Sparkles className="w-10 h-10 text-accent mb-3" />
              <h3 className="text-lg font-semibold mb-2">Virtual Try-On</h3>
              <p className="text-sm text-muted-foreground">See how designs look before you buy</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              size="lg"
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              onClick={handleStartTour}
            >
              Start Tour
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-2"
              onClick={handleSkipTour}
            >
              Skip for Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Tour */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--card))',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '1rem',
            padding: '1.5rem',
          },
          buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            borderRadius: '0.5rem',
            padding: '0.5rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
          },
          buttonBack: {
            color: 'hsl(var(--muted-foreground))',
            marginRight: '0.5rem',
          },
          buttonSkip: {
            color: 'hsl(var(--muted-foreground))',
          },
        }}
      />
    </>
  );
};
