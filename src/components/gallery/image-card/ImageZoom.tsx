
import { useState } from "react";
import { ImageOverlay } from "./ImageOverlay";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { optimizeImage } from "@/utils/seo";

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

  // Toggle zoom effect
  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click handler for opening the preview
    if (isZoomed) {
      setZoomFactor(1);
      setIsZoomed(false);
    } else {
      setZoomFactor(2); // Initial zoom level on click
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

  return (
    <div 
      className="relative group cursor-pointer h-64 w-full" 
      onClick={onImageClick}
      onDoubleClick={onDoubleClick}
    >
      <AspectRatio ratio={16/9} className="h-full w-full">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover transition-all duration-300"
          loading="lazy"
          style={{
            transform: isZoomed ? `scale(${zoomFactor})` : 'none',
            transformOrigin: 'center',
            filter: isZoomed ? 'brightness(110%)' : 'none'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </AspectRatio>
      
      <ImageOverlay 
        isZoomed={isZoomed}
        zoomFactor={zoomFactor}
        onToggleZoom={toggleZoom}
        onZoomIn={increaseZoom}
        onZoomOut={decreaseZoom}
      />
    </div>
  );
};
