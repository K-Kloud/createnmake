
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageControls } from "./image-preview/ImageControls";
import { useImagePermissions } from "./image-preview/useImagePermissions";
import { useImageDeletion } from "./image-preview/useImageDeletion";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "../ui/button";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  prompt: string;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  imageId?: number;
  userId?: string;
}

export const ImagePreviewDialog = ({
  open,
  onOpenChange,
  imageUrl,
  prompt,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  imageId,
  userId
}: ImagePreviewDialogProps) => {
  const { canDelete } = useImagePermissions(userId);
  const { isDeleting, handleDelete } = useImageDeletion(
    () => onOpenChange(false)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-1 sm:p-6 bg-background/95 backdrop-blur-sm">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative">
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full object-contain transition-transform duration-200 rounded-lg"
            style={{ transform: `scale(${zoomLevel})` }}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={onZoomIn}
              className="bg-background/80 backdrop-blur-sm hover:bg-background/60"
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom In</span>
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={onZoomOut}
              className="bg-background/80 backdrop-blur-sm hover:bg-background/60"
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom Out</span>
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="bg-background/80 backdrop-blur-sm hover:bg-background/60"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm md:text-base">{prompt}</p>
          </div>
          
          <ImageControls
            zoomLevel={zoomLevel}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onDelete={() => handleDelete(imageId, userId, canDelete)}
            canDelete={canDelete}
            isDeleting={isDeleting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
