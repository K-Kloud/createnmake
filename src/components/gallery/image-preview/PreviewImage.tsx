
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<'fit' | 'actual'>('fit');
  
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

  const toggleViewMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewMode(prev => prev === 'fit' ? 'actual' : 'fit');
  };
  
  const getImageStyles = () => {
    const baseStyles = {
      transform: `scale(${currentZoom})`,
      transition: 'all 0.3s ease',
    };

    if (viewMode === 'actual') {
      return {
        ...baseStyles,
        maxWidth: 'none',
        maxHeight: 'none',
        width: 'auto',
        height: 'auto',
      };
    }

    return {
      ...baseStyles,
      maxWidth: isMaximized ? '100vw' : '100%',
      maxHeight: isMaximized ? '100vh' : '80vh',
    };
  };

  const imageClasses = `
    object-contain
    ${isEntering ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
    hover:shadow-[0_0_30px_rgba(0,255,157,0.25)]
    ${viewMode === 'actual' ? 'w-auto h-auto' : 'w-full h-full'}
  `;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* View Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleViewMode}
          className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-none"
        >
          {viewMode === 'fit' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          <span className="ml-1 text-xs">
            {viewMode === 'fit' ? 'Actual Size' : 'Fit to Screen'}
          </span>
        </Button>
      </div>

      <picture>
        <source srcSet={avifUrl} type="image/avif" />
        <source srcSet={webpUrl} type="image/webp" />
        <img 
          src={imageUrl} 
          alt={prompt} 
          style={getImageStyles()}
          className={imageClasses}
          onLoad={onLoad}
          onError={onError}
          onDoubleClick={onDoubleClick}
          loading="eager"
          decoding="async"
        />
      </picture>
    </div>
  );
};
