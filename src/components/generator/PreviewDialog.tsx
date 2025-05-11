
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePreviewDialog } from "./preview/usePreviewDialog";
import { GeneratingState } from "./preview/GeneratingState";
import { ImagePreview } from "./preview/ImagePreview";
import { EmptyPreview } from "./preview/EmptyPreview";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  selectedRatio: string;
  generatedImageUrl?: string;
  onLike?: (imageId: number) => void;
}

export const PreviewDialog = ({ 
  open, 
  onOpenChange, 
  isGenerating,
  selectedRatio,
  generatedImageUrl,
  onLike 
}: PreviewDialogProps) => {
  const { 
    isFullScreenPreview,
    setIsFullScreenPreview 
  } = usePreviewDialog();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generated Image Preview</DialogTitle>
        </DialogHeader>
        <div 
          className="bg-card/50 rounded-lg flex flex-col items-center justify-center min-h-[400px] gap-4"
        >
          {isGenerating ? (
            <GeneratingState />
          ) : generatedImageUrl ? (
            <ImagePreview 
              generatedImageUrl={generatedImageUrl} 
              onLike={onLike} 
            />
          ) : (
            <EmptyPreview />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
