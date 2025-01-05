import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  prompt: string;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ImagePreviewDialog = ({
  open,
  onOpenChange,
  imageUrl,
  prompt,
  zoomLevel,
  onZoomIn,
  onZoomOut,
}: ImagePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <div className="relative">
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full object-contain transition-transform duration-200 rounded-lg"
            style={{ transform: `scale(${zoomLevel})` }}
          />
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};