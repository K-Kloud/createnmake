
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface PreviewDialogHookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialZoom?: number;
  imageId?: number;
  onLike?: (imageId: number) => void;
}

export const usePreviewDialog = ({
  open,
  onOpenChange,
  initialZoom = 1,
  imageId,
  onLike
}: PreviewDialogHookProps) => {
  const { toast } = useToast();
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [isEntering, setIsEntering] = useState(false);

  // Animation effect when opening
  useEffect(() => {
    if (open) {
      setIsEntering(true);
      setTimeout(() => setIsEntering(false), 300);
    }
  }, [open]);

  // Handle zoom in with updated zoom level tracking
  const handleZoomIn = useCallback(() => {
    setCurrentZoom(prev => Math.min(prev + 0.5, 5));
  }, []);

  // Handle zoom out with updated zoom level tracking
  const handleZoomOut = useCallback(() => {
    setCurrentZoom(prev => Math.max(prev - 0.5, 1));
  }, []);

  // Toggle maximized state
  const toggleMaximized = useCallback(() => {
    setIsMaximized(prev => !prev);
    // Reset zoom when toggling maximized state
    setCurrentZoom(1);
  }, []);

  const togglePromptVisibility = useCallback(() => {
    setIsPromptVisible(prev => !prev);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(true);
    toast({
      title: "Image Error",
      description: "Failed to load image. Using placeholder instead.",
      variant: "destructive",
    });
  }, [toast]);

  // Handle double-click to like the image
  const handleDoubleClick = useCallback(() => {
    if (onLike && imageId) {
      onLike(imageId);
      toast({
        title: "Image liked",
        description: "You've liked this image",
      });
    }
  }, [onLike, imageId, toast]);
  
  // Handle keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isMaximized) {
        setIsMaximized(false);
      } else {
        onOpenChange(false);
      }
    } else if (e.key === '+' || e.key === '=') {
      handleZoomIn();
    } else if (e.key === '-') {
      handleZoomOut();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMaximized();
    } else if (e.key === 'p' || e.key === 'P') {
      togglePromptVisibility();
    }
  }, [isMaximized, onOpenChange, handleZoomIn, handleZoomOut, toggleMaximized, togglePromptVisibility]);

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, handleKeyDown]);

  return {
    isPromptVisible,
    setIsPromptVisible,
    currentZoom,
    setCurrentZoom,
    imageLoaded,
    isMaximized,
    isEntering,
    handleZoomIn,
    handleZoomOut,
    toggleMaximized,
    togglePromptVisibility,
    handleImageLoad,
    handleImageError,
    handleDoubleClick,
    toast
  };
};
