
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { ImageLoadingFix } from "./ImageLoadingFix";

interface ImagePreviewProps {
  imageUrl: string;
  prompt: string;
  onLike: (imageId: number) => void;
}

export const ImagePreview = ({ imageUrl, prompt, onLike }: ImagePreviewProps) => {
  const [viewMode, setViewMode] = useState<'fit' | 'actual'>('fit');
  
  console.log("🖼️ ImagePreview rendering with:", { imageUrl, prompt });

  const handleImageLoad = () => {
    console.log("✅ Image loaded successfully:", imageUrl);
  };

  const handleImageError = (error: any) => {
    console.error("❌ Image failed to load:", error, "URL:", imageUrl);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'fit' ? 'actual' : 'fit');
  };

  return (
    <div className="flex items-center justify-center h-full w-full relative">
      {/* View Mode Toggle */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleViewMode}
          className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-none"
        >
          {viewMode === 'fit' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          <span className="ml-1 text-xs">
            {viewMode === 'fit' ? 'Actual Size' : 'Fit'}
          </span>
        </Button>
      </div>

      <ImageLoadingFix
        imageUrl={imageUrl}
        alt={prompt}
        className={`rounded-lg transition-all duration-300 ${
          viewMode === 'fit' 
            ? 'w-full h-full object-contain' 
            : 'max-w-none max-h-none w-auto h-auto object-contain'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};
