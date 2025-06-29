
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useImagePermissions } from "./image-preview/useImagePermissions";
import { useImageDeletion } from "./image-preview/useImageDeletion";
import { ImageControls } from "./image-preview/ImageControls";
import { PreviewImage } from "./image-preview/PreviewImage";
import { PreviewControls } from "./image-preview/PreviewControls";
import { PromptDisplay } from "./image-preview/PromptDisplay";
import { ZoomIndicator } from "./image-preview/ZoomIndicator";
import { usePreviewDialog } from "./image-preview/usePreviewDialog";
import { useRef } from "react";

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
  showPrompt?: boolean;
  isGeneratedImage?: boolean;
  onLike?: (imageId: number) => void;
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const { canDelete } = useImagePermissions(userId);
  const { isDeleting, handleDelete } = useImageDeletion(() => onOpenChange(false));
  
  // Use our custom hook for preview dialog logic
  const {
    isPromptVisible,
    currentZoom,
    imageLoaded,
    isMaximized,
    isEntering,
    handleZoomIn,
    handleZoomOut,
    toggleMaximized,
    togglePromptVisibility,
    handleImageLoad,
    handleImageError,
    handleDoubleClick
  } = usePreviewDialog({
    open,
    onOpenChange,
    initialZoom: zoomLevel,
    imageId,
    onLike
  });
  
  const dialogClasses = isMaximized 
    ? "max-w-[100vw] max-h-[100vh] w-full h-full p-0 sm:p-0 inset-0 rounded-none bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden" 
    : "max-w-[95vw] max-h-[95vh] w-full h-full p-1 sm:p-6 bg-background/95 backdrop-blur-sm flex flex-col";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={dialogRef}
        className={`${dialogClasses} z-[100] transition-all duration-300`}
      >
        <DialogTitle className="sr-only">Image Preview - Full Size View</DialogTitle>
        
        <div className="relative flex-1 flex items-center justify-center w-full h-full overflow-auto">
          <div className="w-full h-full flex justify-center items-center">
            <div className={`flex items-center justify-center ${isMaximized ? 'w-full h-full' : 'w-full h-full max-w-none'}`}>
              <div className="relative w-full h-full flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                <PreviewImage 
                  imageUrl={imageUrl}
                  prompt={prompt}
                  currentZoom={currentZoom}
                  isMaximized={isMaximized}
                  isEntering={isEntering}
                  onDoubleClick={handleDoubleClick}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                
                <ZoomIndicator 
                  zoomLevel={currentZoom} 
                  isVisible={imageLoaded} 
                />
              </div>
            </div>
          </div>
          
          <PreviewControls 
            isMaximized={isMaximized}
            isPromptVisible={isPromptVisible}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleMaximized={toggleMaximized}
            onTogglePrompt={togglePromptVisibility}
            onClose={() => onOpenChange(false)}
          />
          
          <PromptDisplay 
            isVisible={isPromptVisible && !isGeneratedImage}
            prompt={prompt}
          />
          
          {!isMaximized && (
            <ImageControls 
              zoomLevel={currentZoom} 
              onZoomIn={handleZoomIn} 
              onZoomOut={handleZoomOut} 
              onDelete={() => handleDelete(imageId, userId, canDelete)} 
              canDelete={canDelete} 
              isDeleting={isDeleting} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
