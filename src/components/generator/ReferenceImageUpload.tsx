
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ReferenceImageUploadProps {
  onUpload: (file: File | null) => void;
  file: File | null;
  disabled?: boolean;
}

export const ReferenceImageUpload = ({ 
  onUpload, 
  file, 
  disabled = false 
}: ReferenceImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (file) {
      // Clean up previous URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create new URL for the file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImageError(false);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setImageError(false);
    }
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onUpload(selectedFile);
  };

  const handleClearFile = () => {
    onUpload(null);
  };

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
      <label className="text-sm font-medium">Reference Image (Optional)</label>
      
      {file ? (
        <div className="space-y-2">
          <div className="relative">
            {imageError ? (
              <div className="w-full h-48 border-2 border-dashed border-border rounded-md flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Failed to load image</p>
                  <p className="text-xs text-muted-foreground mt-1">{file?.name}</p>
                </div>
              </div>
            ) : previewUrl ? (
              <img 
                src={previewUrl} 
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
              onClick={handleClearFile}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      ) : (
        <div className="relative h-48 border-2 border-dashed border-border rounded-md p-4 flex items-center justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground animate-bounce-slow button-glow"
                size="icon"
                disabled={disabled}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <label 
                htmlFor="file-upload" 
                className={`
                  flex flex-col items-center justify-center cursor-pointer
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Add reference image</span>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={disabled}
                />
              </label>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
