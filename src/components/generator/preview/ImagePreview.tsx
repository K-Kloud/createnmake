
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PreviewActions } from "./PreviewActions";

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
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Generated Image</h3>
        <p className="text-sm text-muted-foreground mb-4">{prompt}</p>
      </div>
      
      <AspectRatio ratio={1}>
        <img
          src={imageUrl}
          alt={prompt}
          className="w-full h-full object-cover rounded-lg"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </AspectRatio>
      
      <PreviewActions
        generatedImageUrl={imageUrl}
      />
    </div>
  );
};
