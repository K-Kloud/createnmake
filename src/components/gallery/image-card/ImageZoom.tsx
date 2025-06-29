import { useState } from "react";
import { ImageOverlay } from "./ImageOverlay";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<'cover' | 'contain'>('contain');

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

  const toggleViewMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode(prev => prev === 'cover' ? 'contain' : 'cover');
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
      className="relative group cursor-pointer w-full" 
      onClick={onImageClick}
      onDoubleClick={onDoubleClick}
      style={{ aspectRatio: viewMode === 'contain' ? 'auto' : '16/9' }}
    >
      {/* View Mode Toggle */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleViewMode}
          className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-none"
        >
          {viewMode === 'cover' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </Button>
      </div>

      <div className={`w-full ${viewMode === 'contain' ? 'h-auto' : 'h-full'} overflow-hidden rounded-lg`}>
        {!imageLoaded && !imageError && (
          <div className="w-full h-48 bg-muted/20 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError && (
          <div className="w-full h-48 bg-muted/40 flex items-center justify-center">
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
          className={`w-full transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${viewMode === 'cover' ? 'h-full object-cover' : 'h-auto object-contain'}`}
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
      </div>
      
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
