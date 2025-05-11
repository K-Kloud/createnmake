
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ImagePromptProps {
  prompt: string;
  initialShowPrompt?: boolean;
}

export const ImagePrompt = ({ 
  prompt, 
  initialShowPrompt = true 
}: ImagePromptProps) => {
  const [showPrompt, setShowPrompt] = useState(initialShowPrompt);

  return (
    <div className="flex items-center justify-between">
      <p className={`text-sm text-gray-300 ${showPrompt ? 'truncate' : 'hidden'}`}>
        {prompt}
      </p>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowPrompt(!showPrompt)}
        className="ml-2"
      >
        {showPrompt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">{showPrompt ? 'Hide' : 'Show'} Prompt</span>
      </Button>
    </div>
  );
};
