
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ImagePromptProps {
  prompt: string;
  initialShowPrompt?: boolean;
  maxLength?: number;
  className?: string;
}

export const ImagePrompt = ({ 
  prompt, 
  initialShowPrompt = true,
  maxLength = 100,
  className = ""
}: ImagePromptProps) => {
  const [showPrompt, setShowPrompt] = useState(initialShowPrompt);
  const { t } = useTranslation('common');
  
  // Truncate prompt if it's too long
  const displayPrompt = prompt.length > maxLength ? 
    `${prompt.substring(0, maxLength)}...` : prompt;

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
        title={showPrompt ? t('imageCard.hidePrompt') : t('imageCard.showPrompt')}
      >
        {showPrompt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">{showPrompt ? t('imageCard.hidePrompt') : t('imageCard.showPrompt')}</span>
      </Button>
    </div>
  );
};
