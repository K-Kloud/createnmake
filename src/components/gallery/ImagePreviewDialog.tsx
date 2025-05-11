
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageControls } from "./image-preview/ImageControls";
import { useImagePermissions } from "./image-preview/useImagePermissions";
import { useImageDeletion } from "./image-preview/useImageDeletion";
import { X, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

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
  showPrompt?: boolean; // Default prop
  isGeneratedImage?: boolean; // New prop to identify generated images
  onLike?: (imageId: number) => void; // Add onLike prop
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
  userId,
  showPrompt = true,
  isGeneratedImage = false,
  onLike
}: ImagePreviewDialogProps) => {
  // Initialize with showPrompt prop but hide by default for generated images
  const [isPromptVisible, setIsPromptVisible] = useState(isGeneratedImage ? false : showPrompt);
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);

  // Update visibility when showPrompt prop changes
  useEffect(() => {
    setIsPromptVisible(isGeneratedImage ? false : showPrompt);
  }, [showPrompt, isGeneratedImage]);
  
  const { canDelete } = useImagePermissions(userId);
  const { isDeleting, handleDelete } = useImageDeletion(() => onOpenChange(false));

  // Handle double-click to like the image
  const handleDoubleClick = () => {
    if (onLike && imageId) {
      onLike(imageId);
    }
  };

  // Handle zoom in with updated zoom level tracking - fixed to avoid testing void for truthiness
  const handleZoomInWithTracking = () => {
    onZoomIn();
    setCurrentZoom(Math.min(currentZoom + 0.5, 5));
  };

  // Handle zoom out with updated zoom level tracking - fixed to avoid testing void for truthiness
  const handleZoomOutWithTracking = () => {
    onZoomOut();
    setCurrentZoom(Math.max(currentZoom - 0.5, 1));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-1 sm:p-6 bg-background/95 backdrop-blur-sm flex flex-col">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        
        <div className="relative flex-1 flex items-center justify-center w-full h-full min-h-[50vh]">
          <div 
            className="w-full h-full flex justify-center items-center" 
            onDoubleClick={handleDoubleClick}
          >
            <div className={`w-full h-full flex items-center justify-center ${isGeneratedImage ? 'max-w-5xl' : 'w-full'}`}>
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt={prompt} 
                  style={{
                    transform: `scale(${currentZoom})`
                  }} 
                  className="max-w-full max-h-[80vh] object-contain transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,157,0.25)]" 
                />
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {currentZoom.toFixed(1)}x zoom
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button variant="secondary" size="icon" onClick={handleZoomInWithTracking} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom In</span>
            </Button>
            <Button variant="secondary" size="icon" onClick={handleZoomOutWithTracking} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom Out</span>
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setIsPromptVisible(!isPromptVisible)} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              {isPromptVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{isPromptVisible ? 'Hide' : 'Show'} Prompt</span>
            </Button>
            <Button variant="secondary" size="icon" onClick={() => onOpenChange(false)} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {isPromptVisible && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm md:text-base">{prompt}</p>
            </div>
          )}
          
          <ImageControls 
            zoomLevel={currentZoom} 
            onZoomIn={handleZoomInWithTracking} 
            onZoomOut={handleZoomOutWithTracking} 
            onDelete={() => handleDelete(imageId, userId, canDelete)} 
            canDelete={canDelete} 
            isDeleting={isDeleting} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
