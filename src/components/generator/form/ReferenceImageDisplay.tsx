
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface ReferenceImageDisplayProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

export const ReferenceImageDisplay = ({ 
  file, 
  onRemove, 
  disabled = false 
}: ReferenceImageDisplayProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (file) {
      // Clean up previous URL
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      // Create new URL for the file
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setImageError(false);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const handleImageError = () => {
    console.error("Failed to load reference image:", file?.name);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log("Reference image loaded successfully:", file?.name);
    setImageError(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Reference Image</label>
      <div className="relative">
        {imageError ? (
          <div className="w-full h-48 border-2 border-dashed border-border rounded-md flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Failed to load image</p>
              <p className="text-xs text-muted-foreground mt-1">{file?.name}</p>
            </div>
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Reference" 
            className="w-full rounded-md object-cover max-h-48"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-48 border-2 border-dashed border-border rounded-md flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Loading image...</p>
            </div>
          </div>
        )}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      {file && (
        <p className="text-xs text-muted-foreground">
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  );
};
