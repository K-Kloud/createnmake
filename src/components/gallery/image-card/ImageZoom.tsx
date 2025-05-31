
import { useState } from "react";
import { ImageOverlay } from "./ImageOverlay";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageZoomProps {
  imageUrl: string;
  alt: string;
  onImageClick: () => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}

export const ImageZoom = ({
  imageUrl,
  alt,
  onImageClick,
  onDoubleClick
}: ImageZoomProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Toggle zoom effect
  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setZoomFactor(1);
      setIsZoomed(false);
    } else {
      setZoomFactor(2);
      setIsZoomed(true);
    }
  };

  // Increase zoom level
  const increaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setZoomFactor(prev => Math.min(prev + 0.5, 5));
    }
  };

  // Decrease zoom level
  const decreaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setZoomFactor(prev => Math.max(prev - 0.5, 1));
      if (zoomFactor <= 1) {
        setIsZoomed(false);
      }
    }
  };

  const handleImageLoad = () => {
    console.log("✅ Image loaded successfully:", imageUrl);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error("❌ Image failed to load:", imageUrl);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div 
      className="relative group cursor-pointer h-auto w-full" 
      onClick={onImageClick}
      onDoubleClick={onDoubleClick}
    >
      <AspectRatio ratio={16/9} className="h-full w-full">
        {!imageLoaded && !imageError && (
          <div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError && (
          <div className="w-full h-full bg-muted/40 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-muted-foreground text-sm">Failed to load image</div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setImageError(false);
                  setImageLoaded(false);
                }}
                className="text-xs text-primary hover:underline mt-1"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <img
          src={imageUrl}
          alt={alt}
          width="800"
          height="450"
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          style={{
            transform: isZoomed ? `scale(${zoomFactor})` : 'none',
            transformOrigin: 'center',
            filter: isZoomed ? 'brightness(110%)' : 'none'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </AspectRatio>
      
      <ImageOverlay 
        isZoomed={isZoomed}
        zoomFactor={zoomFactor}
        onToggleZoom={toggleZoom}
        onZoomIn={increaseZoom}
        onZoomOut={decreaseZoom}
        onExpandClick={onImageClick}
      />
    </div>
  );
};
