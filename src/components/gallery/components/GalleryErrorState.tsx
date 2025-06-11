
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff } from "lucide-react";

interface GalleryErrorStateProps {
  onRetry: () => void;
  t: (key: string) => string;
}

export const GalleryErrorState = ({ onRetry, t }: GalleryErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <WifiOff className="h-16 w-16 text-gray-400" />
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{t('connectionProblem')}</h3>
        <p className="text-gray-600 max-w-md">{t('connectionDescription')}</p>
      </div>
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        {t('tryAgain')}
      </Button>
    </div>
  );
};
