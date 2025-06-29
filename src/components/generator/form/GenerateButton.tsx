
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onClick}
              disabled={disabled || isGenerating}
              className="w-full neon-button glow-effect group relative overflow-hidden"
              size="lg"
            >
              {/* Background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="font-rajdhani font-semibold">Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5 group-hover:animate-neon-pulse" />
                  <span className="font-rajdhani font-semibold">Generate Design</span>
                  <Sparkles className="ml-2 h-4 w-4 group-hover:animate-neon-pulse delay-100" />
                </>
              )}
            </Button>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent className="glass-card border-white/20">
              <p className="font-rajdhani">
                {!disabled ? "Click to generate your design" : "Please enter a prompt to generate a design"}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {remainingImages !== undefined && remainingImages > 0 && (
        <p className="text-xs text-center mt-2 font-rajdhani text-muted-foreground">
          You have <span className="text-accent font-semibold">{remainingImages}</span> image{remainingImages !== 1 ? 's' : ''} remaining this month
        </p>
      )}
    </div>
  );
};
