
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    
    if (selectedFile) {
      onUpload(selectedFile);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
    } else {
      onUpload(null);
      setPreviewUrl(null);
    }
  };

  const handleClearFile = () => {
    onUpload(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Reference Image (Optional)</label>
      
      {file && previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Reference" 
            className="w-full rounded-md object-cover max-h-48"
          />
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
      ) : (
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md h-32">
          <div className="space-y-2 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="flex flex-col items-center text-xs text-muted-foreground">
              <label 
                htmlFor="file-upload" 
                className="relative cursor-pointer rounded-md bg-background px-2 py-1 text-primary hover:text-primary/80 transition-colors"
              >
                {disabled ? (
                  <span>Upload Disabled</span>
                ) : (
                  <span>Upload an image</span>
                )}
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
              <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
