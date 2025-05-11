
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Trash2 } from "lucide-react";

interface ImageControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  isDeleting?: boolean;
}

export const ImageControls = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onDelete,
  canDelete,
  isDeleting
}: ImageControlsProps) => {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onZoomOut}
        disabled={zoomLevel <= 0.5}
        className="bg-background/80 backdrop-blur-sm hover:bg-background/60"
      >
        <ZoomOut className="h-4 w-4" />
        <span className="sr-only">Zoom Out</span>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onZoomIn}
        disabled={zoomLevel >= 3}
        className="bg-background/80 backdrop-blur-sm hover:bg-background/60"
      >
        <ZoomIn className="h-4 w-4" />
        <span className="sr-only">Zoom In</span>
      </Button>
      {canDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/60"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      )}
    </div>
  );
};
