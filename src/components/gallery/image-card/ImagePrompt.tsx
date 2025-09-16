
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ImagePromptProps {
  prompt: string;
  initialShowPrompt?: boolean;
  maxLength?: number;
  className?: string;
  isCreator?: boolean;
}

export const ImagePrompt = ({ 
  prompt, 
  initialShowPrompt = true,
  maxLength = 100,
  className = "",
  isCreator = false
}: ImagePromptProps) => {
  const [showPrompt, setShowPrompt] = useState(initialShowPrompt);
  
  // Truncate prompt if it's too long
  const displayPrompt = prompt.length > maxLength ? 
    `${prompt.substring(0, maxLength)}...` : prompt;

  // Only show prompt if user is the creator
  if (!isCreator) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className={`text-sm text-gray-300 ${showPrompt ? 'truncate' : 'hidden'}`}>
        {displayPrompt}
      </p>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowPrompt(!showPrompt)}
        className="ml-2 flex-shrink-0"
        title={showPrompt ? 'Hide prompt' : 'Show prompt'}
      >
        {showPrompt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">{showPrompt ? 'Hide' : 'Show'} Prompt</span>
      </Button>
    </div>
  );
};
