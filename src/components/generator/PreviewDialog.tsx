
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
import { ImageProviderInfo } from "./ImageProviderInfo";
import { ImageRating } from "./ImageRating";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  selectedRatio: string;
  generatedImageUrl: string | undefined;
  generatedImageId?: number;
  prompt: string;
  provider?: string;
  onLike?: (imageId: number) => void;
}

export const PreviewDialog = ({
  open,
  onOpenChange,
  isGenerating,
  selectedRatio,
  generatedImageUrl,
  generatedImageId,
  prompt,
  provider,
  onLike
}: PreviewDialogProps) => {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(generatedImageUrl);
  const [currentImageId, setCurrentImageId] = useState<number | undefined>(generatedImageId);

  // Update current image when generated image changes
  useEffect(() => {
    setCurrentImageUrl(generatedImageUrl);
    setCurrentImageId(generatedImageId);
  }, [generatedImageUrl, generatedImageId]);

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
                <GeneratingState selectedRatio={selectedRatio} />
              ) : currentImageUrl ? (
                <ImagePreview 
                  imageUrl={currentImageUrl} 
                  prompt={prompt} 
                  onLike={onLike || (() => {})}
                />
              ) : (
                <EmptyPreview selectedRatio={selectedRatio} />
              )}
            </AspectRatio>
          </div>

          {currentImageUrl && (
            <>
              <PreviewActions
                imageUrl={currentImageUrl}
                imageId={currentImageId}
                prompt={prompt}
                onLike={onLike}
                onImageEdited={handleImageEdited}
              />
              
              {/* Provider Information and Rating */}
              <div className="flex flex-col space-y-3 pt-2 border-t border-border/20">
                {provider && (
                  <div className="flex justify-center">
                    <ImageProviderInfo
                      provider={provider}
                      className="text-sm"
                    />
                  </div>
                )}
                
                {currentImageId && provider && (
                  <ImageRating
                    imageId={currentImageId}
                    provider={provider}
                    className="max-w-sm mx-auto"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
