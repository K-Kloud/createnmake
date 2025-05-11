
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";

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
      className="relative group cursor-pointer" 
      onClick={onImageClick}
      onDoubleClick={onDoubleClick}
    >
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-64 object-contain transition-all duration-300 ${isZoomed ? 'scale-['+zoomFactor+'] brightness-110' : 'group-hover:brightness-110'}`}
        style={{
          transform: isZoomed ? `scale(${zoomFactor})` : 'none',
          transformOrigin: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        {isZoomed ? (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={decreaseZoom}
              className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
            >
              Zoom Out
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={increaseZoom}
              className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
            >
              Zoom In ({zoomFactor}x)
            </Button>
          </div>
        ) : (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={toggleZoom}
            className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
          >
            <Maximize size={18} />
            Zoom Image
          </Button>
        )}
      </div>
    </div>
  );
};
