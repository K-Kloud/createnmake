
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ImagePreviewDialog } from "@/components/gallery/ImagePreviewDialog";
import { PreviewActions } from "./PreviewActions";
import { Maximize2 } from "lucide-react";

interface ImagePreviewProps {
  generatedImageUrl: string;
  onLike?: (imageId: number) => void;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export const ImagePreview = ({ 
  generatedImageUrl, 
  onLike,
  zoomLevel = 1,
  onZoomIn,
  onZoomOut 
}: ImagePreviewProps) => {
  const { toast } = useToast();
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const localZoomLevel = zoomLevel || 1;
  
  const handleZoomIn = () => {
    if (onZoomIn) {
      onZoomIn();
    } else {
      toast({
        title: "Zoom in",
        description: "Image zoomed in.",
      });
    }
  };

  const handleZoomOut = () => {
    if (onZoomOut) {
      onZoomOut();
    } else {
      toast({
        title: "Zoom out",
        description: "Image zoomed out.",
      });
    }
  };

  const handleFullScreenPreview = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsFullScreenPreview(true);
  };

  return (
    <>
      <div className="relative w-full flex flex-col items-center">
        <div 
          className="relative cursor-pointer group w-full max-h-[500px] flex justify-center" 
          onClick={handleFullScreenPreview}
        >
          <img 
            src={generatedImageUrl} 
            alt="Generated preview" 
            className="rounded-lg max-h-[500px] max-w-full object-contain transition-all hover:scale-105 duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
              toast({
                title: "Error",
                description: "Failed to load image",
                variant: "destructive",
              });
            }}
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
            <button 
              className="bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background/60"
              onClick={handleFullScreenPreview}
            >
              <Maximize2 className="h-5 w-5" />
              <span className="sr-only">View full screen</span>
            </button>
          </div>
        </div>
        <PreviewActions generatedImageUrl={generatedImageUrl} />
      </div>

      {isFullScreenPreview && (
        <ImagePreviewDialog
          open={isFullScreenPreview}
          onOpenChange={setIsFullScreenPreview}
          imageUrl={generatedImageUrl}
          prompt=""
          zoomLevel={localZoomLevel}
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
