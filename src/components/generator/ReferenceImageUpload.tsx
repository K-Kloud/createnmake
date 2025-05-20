
import { useState } from "react";
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
