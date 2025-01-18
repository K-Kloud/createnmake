import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageControls } from "./image-preview/ImageControls";
import { useImagePermissions } from "./image-preview/useImagePermissions";
import { useImageDeletion } from "./image-preview/useImageDeletion";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative">
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full object-contain transition-transform duration-200 rounded-lg"
            style={{ transform: `scale(${zoomLevel})` }}
          />
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