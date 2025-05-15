
import { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const usePreviewDialog = () => {
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleFullScreenPreview = useCallback(() => {
    setIsFullScreenPreview(true);
  }, []);

  const toggleShowPrompt = useCallback(() => {
    setShowPrompt(prev => !prev);
  }, []);

  return {
    isFullScreenPreview, 
    setIsFullScreenPreview,
    zoomLevel,
    setZoomLevel,
    showPrompt,
    setShowPrompt,
    handleZoomIn,
    handleZoomOut,
    handleFullScreenPreview,
    toggleShowPrompt,
    toast
  };
};
