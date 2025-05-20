
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

  return (
    <div className="w-full space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <Button
                onClick={onClick}
                disabled={disabled || isGenerating}
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Design
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              {!disabled ? 
                "Click to generate your design" : 
                "Please enter a prompt to generate a design"
              }
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {remainingImages !== undefined && remainingImages > 0 && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          You have {remainingImages} image{remainingImages !== 1 ? 's' : ''} remaining this month
        </p>
      )}
    </div>
  );
};
