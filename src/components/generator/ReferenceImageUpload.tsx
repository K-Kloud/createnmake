
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Plus } from "lucide-react";

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
        <div className="border-2 border-dashed border-border rounded-md p-4 text-center">
          <label 
            htmlFor="file-upload" 
            className={`
              flex flex-col items-center justify-center cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-primary" />
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
        </div>
      )}
    </div>
  );
};
