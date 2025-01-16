import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "@/components/ui/image";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageId: string | number;
}

export const ImagePreviewDialog = ({ isOpen, onClose, imageUrl, imageId }: ImagePreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <div className="aspect-square relative">
          <Image
            src={imageUrl}
            alt={`Generated image ${imageId}`}
            className="object-cover rounded-lg"
            fill
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};