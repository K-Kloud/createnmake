import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Share2, Heart, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useResponsive } from '@/hooks/useResponsive';

interface MobileOptimizedImageViewerProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  isLiked?: boolean;
}

export const MobileOptimizedImageViewer: React.FC<MobileOptimizedImageViewerProps> = ({
  src,
  alt,
  isOpen,
  onClose,
  onLike,
  onShare,
  onDownload,
  isLiked = false
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { getOptimizedImageSrc, settings } = usePerformanceOptimization();
  const { isAtLeast } = useResponsive();

  // Reset state when image changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
    }
  }, [src, isOpen]);

  // Handle pinch-to-zoom on mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = scale;
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        setStartPosition({ x: touch.clientX - position.x, y: touch.clientY - position.y });
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const newScale = Math.max(0.5, Math.min(4, initialScale * (distance / initialDistance)));
        setScale(newScale);
      } else if (e.touches.length === 1 && isDragging && scale > 1) {
        const touch = e.touches[0];
        setPosition({
          x: touch.clientX - startPosition.x,
          y: touch.clientY - startPosition.y
        });
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, scale, position, startPosition, isDragging]);

  // Optimize image source for mobile
  const optimizedSrc = getOptimizedImageSrc(src, window.innerWidth, settings.imageQuality === 'high' ? 85 : 70);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          {!isAtLeast('md') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(Math.max(0.5, scale - 0.5))}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(Math.min(4, scale + 0.5))}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`text-white hover:bg-white/20 ${isLiked ? 'text-red-400' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          )}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden touch-none"
        onDoubleClick={() => {
          if (scale === 1) {
            setScale(2);
          } else {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        <img
          ref={imageRef}
          src={optimizedSrc}
          alt={alt}
          className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
            settings.reducedMotion ? 'transition-none' : ''
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            opacity: isLoading ? 0 : 1
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          draggable={false}
        />
      </div>

      {/* Mobile gesture hints */}
      {!isAtLeast('md') && scale === 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm text-center">
          <p>Pinch to zoom • Double tap to zoom</p>
        </div>
      )}
    </div>
  );
};