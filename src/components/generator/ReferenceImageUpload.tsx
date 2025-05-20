
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReferenceImageUploadProps {
  referenceImage: File | null;
  onUpload: (file: File | null) => void;
  disabled?: boolean;
}

export const ReferenceImageUpload = ({ 
  referenceImage, 
  onUpload, 
  disabled = false 
}: ReferenceImageUploadProps) => {
  const { toast } = useToast();

  const convertToWebP = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Use WebP format with quality of 0.8 (80%)
        canvas.toBlob((blob) => {
          if (blob) {
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp'
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        }, 'image/webp', 0.8);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Check initial file size
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Convert to WebP for better compression
      const webpFile = file.type === 'image/webp' ? file : await convertToWebP(file);
      
      // Check converted file size
      if (webpFile.size > 4 * 1024 * 1024) {
        toast({
          title: "Converted file too large",
          description: "The converted WebP file is too large. Please try with a smaller image.",
          variant: "destructive",
        });
        return;
      }

      onUpload(webpFile);
      toast({
        title: "Image uploaded",
        description: "Your reference image has been uploaded successfully. The AI will use this as inspiration.",
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process the image. Please try again with a different image.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="imageUpload"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={disabled}
      />
      <label
        htmlFor="imageUpload"
        className={`absolute -bottom-3 right-2 inline-flex items-center justify-center size-8 rounded-full ${
          disabled 
            ? 'bg-primary/50 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary-hover cursor-pointer transition-colors hover:scale-110 animate-bounce-slow'
        } text-white`}
        title={disabled ? "Cannot upload during generation" : "Upload a reference image for AI to use as inspiration (WebP format, max 4MB)"}
      >
        <Plus className="size-4" />
      </label>
      {referenceImage && (
        <p className="text-sm text-white/70 absolute -bottom-8 right-12">
          {referenceImage.name}
        </p>
      )}
    </div>
  );
};
