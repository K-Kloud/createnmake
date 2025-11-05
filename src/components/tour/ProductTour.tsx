import Joyride, { TooltipRenderProps } from 'react-joyride';
import { useProductTour } from '@/hooks/useProductTour';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  size,
}: TooltipRenderProps) => (
  <div
    {...tooltipProps}
    className="bg-card border border-border rounded-lg shadow-2xl max-w-md p-6 animate-in fade-in-0 zoom-in-95"
  >
    <div className="relative">
      <button
        {...closeProps}
        className="absolute -top-2 -right-2 p-1 hover:bg-muted rounded-full transition-colors"
        aria-label="Skip tour"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="mb-4 text-foreground">
        {step.content}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {index + 1} of {size}
        </div>
        
        <div className="flex gap-2">
          {index > 0 && (
            <Button
              {...backProps}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button
            {...primaryProps}
            size="sm"
            className="gap-1"
          >
            {continuous ? (
              <>
                {index === size - 1 ? 'Finish' : 'Next'}
                {index < size - 1 && <ChevronRight className="h-4 w-4" />}
              </>
            ) : (
              'Got it!'
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export const ProductTour = () => {
  const { run, stepIndex, tourSteps, handleJoyrideCallback } = useProductTour();

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        spotlight: {
          backgroundColor: 'transparent',
          border: '2px solid hsl(var(--primary))',
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
      disableOverlayClose
      hideCloseButton
      disableCloseOnEsc
      spotlightClicks={false}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};
