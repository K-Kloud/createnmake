
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const usePreviewDialog = () => {
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFullScreenPreview = () => {
    setIsFullScreenPreview(true);
  };

  return {
    isFullScreenPreview, 
    setIsFullScreenPreview,
    zoomLevel,
    showPrompt,
    handleZoomIn,
    handleZoomOut,
    handleFullScreenPreview,
    toast
  };
};
