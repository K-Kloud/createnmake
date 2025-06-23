
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
    <div className="w-full space-y-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onClick}
              disabled={disabled || isGenerating}
              size="lg"
              className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
              
              <div className="relative flex items-center gap-3">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Magic...</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <Wand2 className="h-5 w-5 mr-1" />
                      <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                    </div>
                    <span>Generate Design</span>
                  </>
                )}
              </div>
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-full text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
            <span>
              {remainingImages} image{remainingImages !== 1 ? 's' : ''} remaining this month
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
