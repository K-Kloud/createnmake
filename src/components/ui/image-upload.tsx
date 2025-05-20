
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  currentImage?: string | File | null;
  className?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  className = "",
  maxSizeMB = 5,
  allowedTypes = ALLOWED_FILE_TYPES,
  placeholder = "Click to upload an image or drag and drop",
  disabled = false,
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImage && typeof currentImage === "string" ? currentImage : null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const maxSize = maxSizeMB * 1024 * 1024;

  // Generate a preview if currentImage is a File
  if (currentImage instanceof File && !preview) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(currentImage);
  }

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `The file size should be less than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload ${allowedTypes
          .map((type) => type.replace("image/", ""))
          .join(", ")} files only`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      const filePreview = URL.createObjectURL(file);
      setPreview(filePreview);
      onImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (validateFile(file)) {
      const filePreview = URL.createObjectURL(file);
      setPreview(filePreview);
      onImageUpload(file);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-lg border-2 border-dashed transition-all overflow-hidden
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : handleClick}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-auto object-cover"
            />
            {!disabled && onImageRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full opacity-80 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {placeholder}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Select Image
            </Button>
          </div>
        )}
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}
