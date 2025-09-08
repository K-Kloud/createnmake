
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Upload, Loader2 } from "lucide-react";

interface ReferenceImageUploadProps {
  onUpload: (file: File | null) => void;
  file: File | null;
  disabled?: boolean;
  uploading?: boolean;
}

export const ReferenceImageUpload = ({ 
  onUpload, 
  file, 
  disabled = false,
  uploading = false
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
      <label className="text-sm font-medium text-semantic-primary">
        Reference Image (Optional)
      </label>
      
      {file ? (
        <div className="space-y-2 animate-fade-in">
          <div className="relative group">
            {imageError ? (
              <div className="w-full h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Failed to load image</p>
                  <p className="text-xs text-muted-foreground mt-1">{file?.name}</p>
                </div>
              </div>
            ) : previewUrl ? (
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={previewUrl} 
                  alt="Reference" 
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity duration-200"
              onClick={handleClearFile}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{file.name}</span>
            <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            id="reference-image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={disabled || uploading}
          />
          <label 
            htmlFor="reference-image-upload"
            className={`
              relative h-48 border-2 border-dashed border-border rounded-lg
              flex flex-col items-center justify-center gap-3 p-6 cursor-pointer
              transition-all duration-300 hover:border-primary/50 hover:bg-muted/50
              group ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {uploading ? (
              <>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-semantic-primary">Uploading reference image...</p>
                  <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-semantic-primary group-hover:text-primary transition-colors duration-300">
                    Add reference image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, WebP up to 10MB
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
};
