
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  id: string;
  onChange: (url: string) => void;
}

export const ImageUploadField = ({ label, id, onChange }: ImageUploadFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
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
        
        // Use WebP format with 80% quality for good balance between quality and file size
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Convert to WebP for better compression if not already WebP
      const optimizedFile = file.type === 'image/webp' ? file : await convertToWebP(file);
      
      // Use optimized filename with timestamp to prevent conflicts
      const fileExt = 'webp'; // Always use webp extension for converted files
      const timestamp = Date.now();
      const filePath = `portfolio_${timestamp}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully in WebP format for faster loading",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute right-2 top-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Images will be automatically converted to WebP format for faster loading
        </p>
      </div>
    </div>
  );
};
