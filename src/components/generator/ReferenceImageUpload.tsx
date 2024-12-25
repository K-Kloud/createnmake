import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReferenceImageUploadProps {
  referenceImage: File | null;
  onUpload: (file: File | null) => void;
}

export const ReferenceImageUpload = ({ referenceImage, onUpload }: ReferenceImageUploadProps) => {
  const { toast } = useToast();

  const convertToPNG = async (file: File): Promise<File> => {
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
        
        canvas.toBlob((blob) => {
          if (blob) {
            const pngFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
              type: 'image/png'
            });
            resolve(pngFile);
          } else {
            reject(new Error('Failed to convert image to PNG'));
          }
        }, 'image/png', 1.0);
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

      // Convert to PNG if not already PNG
      const pngFile = file.type === 'image/png' ? file : await convertToPNG(file);
      
      // Check converted file size
      if (pngFile.size > 4 * 1024 * 1024) {
        toast({
          title: "Converted file too large",
          description: "The converted PNG file is too large. Please try with a smaller image.",
          variant: "destructive",
        });
        return;
      }

      onUpload(pngFile);
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
      />
      <label
        htmlFor="imageUpload"
        className="absolute -bottom-3 right-2 inline-flex items-center justify-center size-8 rounded-full bg-primary hover:bg-primary-hover text-white cursor-pointer transition-colors hover:scale-110 animate-bounce-slow"
        title="Upload a reference image for AI to use as inspiration (PNG format, max 4MB)"
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