import { Loader2, Wand2 } from "lucide-react";
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
  return <div className="w-full space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            
          </TooltipTrigger>
          {showTooltip && <TooltipContent>
              {!disabled ? "Click to generate your design" : "Please enter a prompt to generate a design"}
            </TooltipContent>}
        </Tooltip>
      </TooltipProvider>
      
      {remainingImages !== undefined && remainingImages > 0 && <p className="text-xs text-center mt-2 text-muted-foreground">
          You have {remainingImages} image{remainingImages !== 1 ? 's' : ''} remaining this month
        </p>}
    </div>;
};