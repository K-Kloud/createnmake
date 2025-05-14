
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
      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center w-full h-full"
      onClick={onExpandClick} // Add click handler to expand the image
    >
      {isZoomed ? (
        <ZoomControls 
          isZoomed={isZoomed}
          zoomFactor={zoomFactor}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      ) : (
        <Button 
          variant="secondary" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent click handler
            onToggleZoom(e);
          }}
          className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
        >
          <Maximize size={18} />
          Zoom Image
        </Button>
      )}
    </div>
  );
};
