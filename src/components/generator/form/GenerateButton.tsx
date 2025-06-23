
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
    <div className="w-full space-y-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onClick}
              disabled={disabled || isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Design
                </>
              )}
            </Button>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent>
              <p>{!disabled ? "Click to generate your design" : "Please enter a prompt to generate a design"}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {remainingImages !== undefined && remainingImages > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {remainingImages} image{remainingImages !== 1 ? 's' : ''} remaining this month
          </p>
        </div>
      )}
    </div>
  );
};
