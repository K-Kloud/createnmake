
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi } from "lucide-react";

interface GalleryEmptyStateProps {
  onRetry: () => void;
  t: (key: string) => string;
}

export const GalleryEmptyState = ({ onRetry, t }: GalleryEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Wifi className="h-16 w-16 text-gray-400" />
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{t('noImagesFound')}</h3>
        <p className="text-gray-600 max-w-md">{t('noImagesDescription')}</p>
      </div>
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        {t('tryAgain')}
      </Button>
    </div>
  );
};
