
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

// Export a ResponsiveImage component that utilizes AspectRatio with modern image formats
interface ResponsiveImageProps {
  src: string;
  alt: string;
  ratio?: number;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: "eager" | "lazy";
}

const ResponsiveImage = ({
  src,
  alt,
  ratio = 16/9,
  className = "",
  width = 800,
  height = 450,
  sizes = "(max-width: 768px) 100vw, 800px",
  loading = "lazy"
}: ResponsiveImageProps) => {
  // Generate URLs for modern formats
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

  const webpSrc = getWebpUrl(src);
  const avifSrc = getAvifUrl(src);

  return (
    <AspectRatio ratio={ratio} className={className}>
      <picture>
        <source srcSet={avifSrc} type="image/avif" />
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          width={width}
          height={height}
          sizes={sizes}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </picture>
    </AspectRatio>
  );
};

export { AspectRatio, ResponsiveImage }
