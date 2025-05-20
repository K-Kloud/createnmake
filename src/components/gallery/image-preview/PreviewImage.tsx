
import { useState } from "react";

interface PreviewImageProps {
  imageUrl: string;
  prompt: string;
  currentZoom: number;
  isMaximized: boolean;
  isEntering: boolean;
  onDoubleClick: () => void;
  onLoad: () => void;
  onError: () => void;
}

export const PreviewImage = ({
  imageUrl,
  prompt,
  currentZoom,
  isMaximized,
  isEntering,
  onDoubleClick,
  onLoad,
  onError
}: PreviewImageProps) => {
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

  const webpUrl = getWebpUrl(imageUrl);
  const avifUrl = getAvifUrl(imageUrl);
  
  const imageClasses = `
    ${isMaximized ? 'max-w-none' : 'max-w-full max-h-[80vh]'} 
    object-contain transition-all duration-300 
    ${isEntering ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
    hover:shadow-[0_0_30px_rgba(0,255,157,0.25)]
  `;

  return (
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
        className={imageClasses}
        onLoad={onLoad}
        onError={onError}
        onDoubleClick={onDoubleClick}
        loading="eager"
        decoding="async"
      />
    </picture>
  );
};
