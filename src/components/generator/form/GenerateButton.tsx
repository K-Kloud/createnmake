
import { Loader2, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled: boolean;
  remainingImages?: number;
}

export const GenerateButton = ({
  onClick,
  isGenerating,
  disabled,
  remainingImages
}: GenerateButtonProps) => {
  const showTooltip = disabled && !isGenerating;
  
  return (
      <div className="w-full space-y-2">
        {remainingImages !== undefined && remainingImages > 0 && (
          <p className="text-xs text-center mt-2 font-rajdhani text-muted-foreground">
            You have <span className="text-accent font-semibold">{remainingImages}</span> image{remainingImages !== 1 ? 's' : ''} remaining this month
          </p>
        )}
      </div>
  );
};
