
import { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const usePreviewDialog = () => {
  const { toast } = useToast();
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  }, []);

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
      // Only show error if it's not a user abort
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(imageUrl);
          toast({
            title: "Link Copied",
            description: "Image URL copied to clipboard instead",
          });
        } catch (clipboardError) {
          toast({
            title: "Error",
            description: "Failed to share or copy image URL",
            variant: "destructive",
          });
        }
      }
    }
  }, [toast]);

  return {
    isFullScreenPreview,
    setIsFullScreenPreview,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleDownload,
    handleShare
  };
};
