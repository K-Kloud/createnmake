
import { Button } from "@/components/ui/button";
import { ZoomControls } from "./ZoomControls";
import { Trash2 } from "lucide-react";

interface ImageOverlayProps {
  isZoomed: boolean;
  zoomFactor: number;
  onToggleZoom: (e: React.MouseEvent) => void;
  onZoomIn: (e: React.MouseEvent) => void;
  onZoomOut: (e: React.MouseEvent) => void;
  onExpandClick: (e: React.MouseEvent) => void;
  canDelete?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
  isDeleting?: boolean;
}

export const ImageOverlay = ({
  isZoomed,
  zoomFactor,
  onToggleZoom,
  onZoomIn,
  onZoomOut,
  onExpandClick,
  canDelete = false,
  onDelete,
  isDeleting = false
}: ImageOverlayProps) => {
  return (
    <div 
      className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center w-full h-full"
      onClick={onExpandClick}
    >
      {/* Delete button for creators and admins */}
      {canDelete && onDelete && (
        <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-red-500/90 backdrop-blur-sm hover:bg-red-600/90 text-white border-none"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}

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
