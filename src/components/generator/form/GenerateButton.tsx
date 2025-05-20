
import { Loader2 } from "lucide-react";

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
      {remainingImages !== undefined && remainingImages > 0 && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          You have {remainingImages} image{remainingImages !== 1 ? 's' : ''} remaining this month
        </p>
      )}
    </>
  );
};
