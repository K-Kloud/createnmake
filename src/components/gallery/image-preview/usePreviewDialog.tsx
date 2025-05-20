
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface PreviewDialogHookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialZoom?: number;
  imageId?: number;
  onLike?: (imageId: number) => void;
  allowDownload?: boolean;
}

export const usePreviewDialog = ({
  open,
  onOpenChange,
  initialZoom = 1,
  imageId,
  onLike,
  allowDownload = true
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

  // Handle download
  const handleDownload = useCallback(async (imageUrl?: string) => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "No image available to download",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle share
  const handleShare = useCallback(async (imageUrl?: string) => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "No image available to share",
        variant: "destructive",
      });
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my generated image!',
          text: 'I created this image using AI',
          url: imageUrl
        });
        
        toast({
          title: "Success",
          description: "Image shared successfully",
        });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Success",
          description: "Image URL copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      if (error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share image. URL copied to clipboard instead.",
          variant: "destructive",
        });
        // Attempt to copy URL as fallback
        try {
          await navigator.clipboard.writeText(imageUrl);
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
        }
      }
    }
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
    } else if (e.key === 'd' || e.key === 'D') {
      // No image URL passed here, will need to be called from component with the URL
      if (allowDownload) handleDownload();
    } else if (e.key === 's' || e.key === 'S') {
      // No image URL passed here, will need to be called from component with the URL
      handleShare();
    }
  }, [isMaximized, onOpenChange, handleZoomIn, handleZoomOut, toggleMaximized, togglePromptVisibility, handleDownload, handleShare, allowDownload]);

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
    handleDownload,
    handleShare,
    toast
  };
};
