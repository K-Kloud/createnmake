
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageControls } from "./image-preview/ImageControls";
import { useImagePermissions } from "./image-preview/useImagePermissions";
import { useImageDeletion } from "./image-preview/useImageDeletion";
import { X, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { AspectRatio } from "../ui/aspect-ratio";

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
  // Default to true for backward compatibility
  isGeneratedImage = false,
  // Default to false
  onLike
}: ImagePreviewDialogProps) => {
  // Initialize with showPrompt prop but hide by default for generated images
  const [isPromptVisible, setIsPromptVisible] = useState(isGeneratedImage ? false : showPrompt);

  // Update visibility when showPrompt prop changes
  useEffect(() => {
    setIsPromptVisible(isGeneratedImage ? false : showPrompt);
  }, [showPrompt, isGeneratedImage]);
  const {
    canDelete
  } = useImagePermissions(userId);
  const {
    isDeleting,
    handleDelete
  } = useImageDeletion(() => onOpenChange(false));

  // Handle double-click to like the image
  const handleDoubleClick = () => {
    if (onLike && imageId) {
      onLike(imageId);
    }
  };
  
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-1 sm:p-6 bg-background/95 backdrop-blur-sm overflow-hidden">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative flex items-center justify-center h-full">
          <div className="overflow-auto max-h-[calc(90vh-120px)] w-full flex justify-center" onDoubleClick={handleDoubleClick}>
            <div className={`transition-all duration-200 ${isGeneratedImage ? 'w-full max-w-4xl' : 'w-full'}`}>
              <img 
                src={imageUrl} 
                alt={prompt} 
                style={{
                  transform: `scale(${zoomLevel})`
                }} 
                className="w-full h-auto transition-transform duration-200 object-contain mx-auto" 
              />
            </div>
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button variant="secondary" size="icon" onClick={onZoomIn} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom In</span>
            </Button>
            <Button variant="secondary" size="icon" onClick={onZoomOut} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
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
          
          {isPromptVisible && <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm md:text-base">{prompt}</p>
            </div>}
          
          <ImageControls zoomLevel={zoomLevel} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onDelete={() => handleDelete(imageId, userId, canDelete)} canDelete={canDelete} isDeleting={isDeleting} />
        </div>
      </DialogContent>
    </Dialog>;
};
