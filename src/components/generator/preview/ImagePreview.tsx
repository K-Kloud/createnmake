
interface ImagePreviewProps {
  imageUrl: string;
  prompt: string;
  onLike: (imageId: number) => void;
}

export const ImagePreview = ({ imageUrl, prompt, onLike }: ImagePreviewProps) => {
  console.log("🖼️ ImagePreview rendering with:", { imageUrl, prompt });

  const handleImageLoad = () => {
    console.log("✅ Image loaded successfully:", imageUrl);
  };

  const handleImageError = (error: any) => {
    console.error("❌ Image failed to load:", error, "URL:", imageUrl);
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <img
        src={imageUrl}
        alt={prompt}
        className="w-full h-full object-cover rounded-lg"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};
