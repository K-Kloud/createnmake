
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
  
  const buttonContent = (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 text-lg font-semibold relative overflow-hidden group"
      size="lg"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
          Generate Image
          <Sparkles className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </Button>
  );
  
  return (
    <div className="w-full space-y-2">
      {showTooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>Please fill in all required fields to generate an image</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        buttonContent
      )}
      
      {remainingImages !== undefined && remainingImages > 0 && (
        <p className="text-xs text-center mt-2 font-rajdhani text-muted-foreground">
          You have <span className="text-accent font-semibold">{remainingImages}</span> image{remainingImages !== 1 ? 's' : ''} remaining this month
        </p>
      )}
    </div>
  );
};
