
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageControls } from "./image-preview/ImageControls";
import { useImagePermissions } from "./image-preview/useImagePermissions";
import { useImageDeletion } from "./image-preview/useImageDeletion";
import { X, ZoomIn, ZoomOut, Eye, EyeOff, Maximize, Minimize } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  // Initialize with showPrompt prop but hide by default for generated images
  const [isPromptVisible, setIsPromptVisible] = useState(isGeneratedImage ? false : showPrompt);
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Update visibility when showPrompt prop changes
  useEffect(() => {
    setIsPromptVisible(isGeneratedImage ? false : showPrompt);
  }, [showPrompt, isGeneratedImage]);
  
  const { canDelete } = useImagePermissions(userId);
  const { isDeleting, handleDelete } = useImageDeletion(() => onOpenChange(false));

  // Helper functions to get WebP and AVIF versions of the image URL
  const getWebpUrl = (url: string) => {
    if (url.toLowerCase().endsWith('.webp')) return url;
    if (url.includes('?')) return `${url}&format=webp`;
    const urlWithoutExt = url.substring(0, url.lastIndexOf('.')) || url;
    return `${urlWithoutExt}.webp`;
  };
  
  const getAvifUrl = (url: string) => {
    if (url.toLowerCase().endsWith('.avif')) return url;
    if (url.includes('?')) return `${url}&format=avif`;
    const urlWithoutExt = url.substring(0, url.lastIndexOf('.')) || url;
    return `${urlWithoutExt}.avif`;
  };

  // Handle double-click to like the image
  const handleDoubleClick = () => {
    if (onLike && imageId) {
      onLike(imageId);
      toast({
        title: "Image liked",
        description: "You've liked this image",
      });
    }
  };

  // Handle zoom in with updated zoom level tracking
  const handleZoomInWithTracking = () => {
    onZoomIn();
    setCurrentZoom(Math.min(currentZoom + 0.5, 5));
  };

  // Handle zoom out with updated zoom level tracking
  const handleZoomOutWithTracking = () => {
    onZoomOut();
    setCurrentZoom(Math.max(currentZoom - 0.5, 1));
  };

  // Toggle maximized state
  const toggleMaximized = () => {
    setIsMaximized(!isMaximized);
    // Reset zoom when toggling maximized state
    if (!isMaximized) {
      setCurrentZoom(1);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true);
    toast({
      title: "Image Error",
      description: "Failed to load image. Using placeholder instead.",
      variant: "destructive",
    });
  };
  
  // Handle keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isMaximized) {
        setIsMaximized(false);
      } else {
        onOpenChange(false);
      }
    } else if (e.key === '+' || e.key === '=') {
      handleZoomInWithTracking();
    } else if (e.key === '-') {
      handleZoomOutWithTracking();
    } else if (e.key === 'm') {
      toggleMaximized();
    }
  }, [isMaximized, onOpenChange, handleZoomInWithTracking, handleZoomOutWithTracking]);

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, handleKeyDown]);
  
  const webpUrl = getWebpUrl(imageUrl);
  const avifUrl = getAvifUrl(imageUrl);
  
  const dialogClasses = isMaximized 
    ? "max-w-[100vw] max-h-[100vh] p-0 sm:p-0 inset-0 rounded-none bg-black/95 backdrop-blur-xl flex flex-col" 
    : "max-w-[95vw] max-h-[95vh] p-1 sm:p-6 bg-background/95 backdrop-blur-sm flex flex-col";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${dialogClasses} z-[100]`}>
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        
        <div className="relative flex-1 flex items-center justify-center w-full h-full">
          <div 
            className="w-full h-full flex justify-center items-center overflow-auto" 
            onDoubleClick={handleDoubleClick}
          >
            <div className={`flex items-center justify-center ${isMaximized ? 'w-full h-full' : 'max-w-5xl'}`}>
              <div className="relative w-full h-full flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <picture>
                  <source srcSet={avifUrl} type="image/avif" />
                  <source srcSet={webpUrl} type="image/webp" />
                  <img 
                    src={imageUrl} 
                    alt={prompt} 
                    style={{ 
                      transform: `scale(${currentZoom})`,
                      maxWidth: isMaximized ? 'none' : '100%',
                      maxHeight: isMaximized ? 'none' : '80vh',
                    }} 
                    className={`${
                      isMaximized ? 'max-w-none' : 'max-w-full max-h-[80vh]'
                    } object-contain transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,157,0.25)]`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="eager"
                    decoding="async"
                  />
                </picture>
                {imageLoaded && (
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {currentZoom.toFixed(1)}x zoom
                  </div>
                )}
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
            <Button variant="secondary" size="icon" onClick={toggleMaximized} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              {isMaximized ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="sr-only">{isMaximized ? 'Exit Full Screen' : 'Full Screen'}</span>
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
          
          {isPromptVisible && prompt && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm md:text-base">{prompt}</p>
            </div>
          )}
          
          {!isMaximized && (
            <ImageControls 
              zoomLevel={currentZoom} 
              onZoomIn={handleZoomInWithTracking} 
              onZoomOut={handleZoomOutWithTracking} 
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
