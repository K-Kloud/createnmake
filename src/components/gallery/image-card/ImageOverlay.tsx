
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import { ZoomControls } from "./ZoomControls";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageOverlayProps {
  isZoomed: boolean;
  zoomFactor: number;
  onToggleZoom: (e: React.MouseEvent) => void;
  onZoomIn: (e: React.MouseEvent) => void;
  onZoomOut: (e: React.MouseEvent) => void;
  onExpandClick: (e: React.MouseEvent) => void; // New prop for expand click
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
      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-100 transition-all duration-300 flex items-center justify-center w-full h-full"
      onClick={onExpandClick} // Add click handler to expand the image
    >
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
