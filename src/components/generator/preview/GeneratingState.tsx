
import { Loader } from "lucide-react";

export const GeneratingState = () => {
  const steps = [
    "Interpreting prompt...",
    "Gathering inspiration...",
    "Designing your creation...",
    "Adding finishing touches..."
  ];

  // Calculate a random index based on the current time to show different messages
  // This creates the illusion of progress through the generation process
  const currentTimeSecond = new Date().getSeconds();
  const stepIndex = Math.floor(currentTimeSecond / 15) % steps.length; // Changes every 15 seconds
  
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center w-full">
      <div className="relative">
        <div className="size-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Generating Your Design</h3>
        <p className="text-muted-foreground">{steps[stepIndex]}</p>
      </div>
      <div className="text-sm text-muted-foreground max-w-xs">
        This may take a moment as our AI carefully crafts your design based on your specifications.
      </div>
    </div>
  );
};
