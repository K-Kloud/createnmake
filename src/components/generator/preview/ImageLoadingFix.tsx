import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ImageLoadingFixProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

/**
 * Image component with proper loading and error handling
 * Ensures images display correctly after generation
 */
export const ImageLoadingFix = ({ 
  imageUrl, 
  alt, 
  className = "",
  onLoad,
  onError 
}: ImageLoadingFixProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    if (!imageUrl) return;
    
    setLoading(true);
    setError(false);
    
    // Preload image to ensure it's ready
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(imageUrl);
      setLoading(false);
      onLoad?.();
    };
    
    img.onerror = (err) => {
      console.error("Image load error:", err);
      setError(true);
      setLoading(false);
      onError?.(err);
    };
    
    img.src = imageUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, onLoad, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/30">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/30">
        <p className="text-sm text-muted-foreground">Failed to load image</p>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
    />
  );
};
