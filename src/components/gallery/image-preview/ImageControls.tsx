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
        disabled={zoomLevel <= 1}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onZoomIn}
        disabled={zoomLevel >= 3}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      {canDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};