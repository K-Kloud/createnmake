
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
      className="w-full relative bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
      size="lg"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Image
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
              <p>Please fill in all required fields</p>
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
