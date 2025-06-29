
import { Button } from "@/components/ui/button";
import { ZoomControls } from "./ZoomControls";

interface ImageOverlayProps {
  isZoomed: boolean;
  zoomFactor: number;
  onToggleZoom: (e: React.MouseEvent) => void;
  onZoomIn: (e: React.MouseEvent) => void;
  onZoomOut: (e: React.MouseEvent) => void;
  onExpandClick: (e: React.MouseEvent) => void;
}

export const ImageOverlay = ({
  isZoomed,
  zoomFactor,
  onToggleZoom,
  onZoomIn,
  onZoomOut,
  onExpandClick
}: ImageOverlayProps) => {
  return (
    <div 
      className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center w-full h-full"
      onClick={onExpandClick}
    >
      {/* Reduced overlay opacity to not interfere with image viewing */}
      {isZoomed && (
        <ZoomControls 
          isZoomed={isZoomed}
          zoomFactor={zoomFactor}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      )}
    </div>
  );
};
