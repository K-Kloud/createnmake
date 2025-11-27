import { Loader2, Sparkles, Cpu, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  selectedRatio: string;
  startTime?: number;
}

export const LoadingState = ({ selectedRatio, startTime }: LoadingStateProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Sparkles, label: "Analyzing prompt", duration: 2000 },
    { icon: Cpu, label: "Processing design", duration: 3000 },
    { icon: Zap, label: "Rendering image", duration: 2000 },
  ];

  useEffect(() => {
    const startProgressTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startProgressTime;
      const newProgress = Math.min((elapsed / 7000) * 100, 95);
      setProgress(newProgress);
      
      if (elapsed < 2000) setCurrentStep(0);
      else if (elapsed < 5000) setCurrentStep(1);
      else setCurrentStep(2);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center w-full">
      <div className="relative">
        <div className="size-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        <CurrentIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-8 text-primary animate-pulse" />
      </div>
      
      <div className="space-y-4 w-full max-w-md">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Generating Your Design</h3>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            {steps[currentStep].label}
          </p>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`size-2 rounded-full transition-all duration-300 ${
                idx <= currentStep ? 'bg-primary scale-110' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground max-w-xs">
        Our AI is crafting your design with precision. This may take a moment.
      </div>
    </div>
  );
};
