import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { GeneratingState } from "./preview/GeneratingState";
import { EmptyPreview } from "./preview/EmptyPreview";
import { ImagePreview } from "./preview/ImagePreview";
import { useEffect, useState } from "react";
import { PreviewActions } from "./preview/PreviewActions";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  selectedRatio: string;
  generatedImageUrl: string | undefined;
  prompt: string;
  onLike?: (imageId: number) => void;
}

export const PreviewDialog = ({
  open,
  onOpenChange,
  isGenerating,
  selectedRatio,
  generatedImageUrl,
  prompt,
  onLike
}: PreviewDialogProps) => {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(generatedImageUrl);
  const [currentImageId, setCurrentImageId] = useState<number | undefined>();

  // Update current image when generated image changes
  useEffect(() => {
    setCurrentImageUrl(generatedImageUrl);
    // You might want to extract image ID from the URL or pass it as a prop
    // For now, we'll use a placeholder
    if (generatedImageUrl) {
      // Extract image ID from URL or get it from context
      // This is a simplified approach - you might need to pass the ID directly
      setCurrentImageId(Date.now()); // Placeholder
    }
  }, [generatedImageUrl]);

  const handleImageEdited = (newImageUrl: string, newImageId: number) => {
    setCurrentImageUrl(newImageUrl);
    setCurrentImageId(newImageId);
  };

  const getRatio = (ratio: string) => {
    switch (ratio) {
      case "portrait":
        return 2 / 3;
      case "landscape":
        return 3 / 2;
      case "square":
      default:
        return 1;
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generated Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative border border-border/20 rounded-lg overflow-hidden bg-muted/30">
            <AspectRatio ratio={getRatio(selectedRatio)}>
              {isGenerating ? (
                <GeneratingState />
              ) : currentImageUrl ? (
                <ImagePreview 
                  imageUrl={currentImageUrl} 
                  prompt={prompt} 
                />
              ) : (
                <EmptyPreview />
              )}
            </AspectRatio>
          </div>

          {currentImageUrl && (
            <PreviewActions
              imageUrl={currentImageUrl}
              imageId={currentImageId}
              prompt={prompt}
              onLike={onLike}
              onImageEdited={handleImageEdited}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
