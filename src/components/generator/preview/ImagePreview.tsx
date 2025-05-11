
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ImagePreviewDialog } from "@/components/gallery/ImagePreviewDialog";
import { PreviewActions } from "./PreviewActions";

interface ImagePreviewProps {
  generatedImageUrl: string;
  onLike?: (imageId: number) => void;
}

export const ImagePreview = ({ generatedImageUrl, onLike }: ImagePreviewProps) => {
  const { toast } = useToast();
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFullScreenPreview = () => {
    setIsFullScreenPreview(true);
  };

  return (
    <>
      <div 
        className="relative cursor-pointer" 
        onClick={handleFullScreenPreview}
      >
        <img 
          src={generatedImageUrl} 
          alt="Generated preview" 
          className="rounded-lg max-h-[500px] object-contain"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
            toast({
              title: "Error",
              description: "Failed to load image",
              variant: "destructive",
            });
          }}
        />
      </div>
      <PreviewActions generatedImageUrl={generatedImageUrl} />

      {isFullScreenPreview && (
        <ImagePreviewDialog
          open={isFullScreenPreview}
          onOpenChange={setIsFullScreenPreview}
          imageUrl={generatedImageUrl}
          prompt=""
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          showPrompt={showPrompt}
          isGeneratedImage={true}
          onLike={onLike}
        />
      )}
    </>
  );
};
