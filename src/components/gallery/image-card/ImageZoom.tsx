
import { useState } from "react";
import { ImageOverlay } from "./ImageOverlay";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageZoomProps {
  imageUrl: string;
  alt: string;
  onImageClick: () => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}

export const ImageZoom = ({
  imageUrl,
  alt,
  onImageClick,
  onDoubleClick
}: ImageZoomProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomFactor, setZoomFactor] = useState(1);

  // Generate WebP and AVIF URLs from original image URL if needed
  // This assumes your server can convert on-the-fly with URL parameters
  // or that you have already pre-generated these formats
  const getWebpUrl = (url: string) => {
    // If the URL already ends with .webp, use it as is
    if (url.toLowerCase().endsWith('.webp')) return url;
    
    // For Supabase and other storage services that use query parameters
    if (url.includes('?')) {
      return `${url}&format=webp`;
    }
    
    // For simple file extensions
    const urlWithoutExt = url.substring(0, url.lastIndexOf('.')) || url;
    return `${urlWithoutExt}.webp`;
  };
  
  const getAvifUrl = (url: string) => {
    // If the URL already ends with .avif, use it as is
    if (url.toLowerCase().endsWith('.avif')) return url;
    
    // For Supabase and other storage services that use query parameters
    if (url.includes('?')) {
      return `${url}&format=avif`;
    }
    
    // For simple file extensions
    const urlWithoutExt = url.substring(0, url.lastIndexOf('.')) || url;
    return `${urlWithoutExt}.avif`;
  };

  // Toggle zoom effect
  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click handler for opening the preview
    if (isZoomed) {
      setZoomFactor(1);
      setIsZoomed(false);
    } else {
      setZoomFactor(2); // Initial zoom level on click
      setIsZoomed(true);
    }
  };

  // Increase zoom level
  const increaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setZoomFactor(prev => Math.min(prev + 0.5, 5));
    }
  };

  // Decrease zoom level
  const decreaseZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setZoomFactor(prev => Math.max(prev - 0.5, 1));
      if (zoomFactor <= 1) {
        setIsZoomed(false);
      }
    }
  };

  // Handle image click for full-screen expansion
  const handleExpandClick = (e: React.MouseEvent) => {
    // Only proceed if we're not zoomed (otherwise let zoom controls handle the click)
    if (!isZoomed) {
      onImageClick();
    }
  };

  const webpUrl = getWebpUrl(imageUrl);
  const avifUrl = getAvifUrl(imageUrl);

  return (
    <div 
      className="relative group cursor-pointer h-auto w-full" 
      onDoubleClick={onDoubleClick}
    >
      <AspectRatio ratio={16/9} className="h-full w-full">
        <picture>
          {/* AVIF format - best compression but less supported */}
          <source srcSet={avifUrl} type="image/avif" />
          {/* WebP format - good compression and widely supported */}
          <source srcSet={webpUrl} type="image/webp" />
          {/* Fallback to original format */}
          <img
            src={imageUrl}
            alt={alt}
            width="800"
            height="450"
            className="w-full h-full object-cover transition-all duration-300"
            loading="lazy"
            decoding="async"
            style={{
              transform: isZoomed ? `scale(${zoomFactor})` : 'none',
              transformOrigin: 'center',
              filter: isZoomed ? 'brightness(110%)' : 'none'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </picture>
      </AspectRatio>
      
      <ImageOverlay 
        isZoomed={isZoomed}
        zoomFactor={zoomFactor}
        onToggleZoom={toggleZoom}
        onZoomIn={increaseZoom}
        onZoomOut={decreaseZoom}
        onExpandClick={handleExpandClick}
      />
    </div>
  );
};
