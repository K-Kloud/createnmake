
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <>
      <Button
        onClick={onClick}
        disabled={disabled || isGenerating}
        className="w-full mt-2"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Design"
        )}
      </Button>
      
      {remainingImages !== undefined && remainingImages > 0 && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          You have {remainingImages} image{remainingImages !== 1 ? 's' : ''} remaining this month
        </p>
      )}
    </>
  );
};
