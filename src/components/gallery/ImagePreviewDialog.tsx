import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageId: number;
}

export const ImagePreviewDialog = ({ isOpen, onClose, imageUrl, imageId }: ImagePreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <div className="aspect-square relative">
          <img
            src={imageUrl}
            alt={`Generated image ${imageId}`}
            className="object-cover rounded-lg w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};