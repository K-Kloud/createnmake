
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useReferenceImageUpload = () => {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Reference image must be smaller than 10MB.",
      });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP).",
      });
      return false;
    }

    return true;
  };

  const uploadReferenceImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    if (!validateFile(file)) {
      return null;
    }

    setUploading(true);

    try {
      // Create unique filename with user folder structure
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      
      console.log('📤 Uploading reference image:', filename);
      
      // Upload reference image to storage
      const { data, error } = await supabase.storage
        .from("reference-images")
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        console.error("❌ Reference image upload error:", error);
        
        let errorMessage = "Failed to upload reference image";
        if (error.message.includes("duplicate")) {
          errorMessage = "A file with this name already exists. Please try again.";
        } else if (error.message.includes("size")) {
          errorMessage = "File size exceeds the limit.";
        } else if (error.message.includes("type")) {
          errorMessage = "File type not supported.";
        }
        
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: errorMessage,
        });
        return null;
      }
      
      console.log('✅ Reference image uploaded successfully:', data.path);
      
      // Get public URL for the uploaded reference image
      const { data: publicUrl } = supabase.storage
        .from("reference-images")
        .getPublicUrl(data.path);
        
      console.log('🔗 Reference image public URL:', publicUrl.publicUrl);
      
      // Verify the upload was successful by testing the URL
      try {
        const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('Uploaded file is not accessible');
        }
      } catch (verifyError) {
        console.error('❌ Failed to verify uploaded file:', verifyError);
        toast({
          variant: "destructive",
          title: "Upload Verification Failed",
          description: "The file was uploaded but may not be accessible. Please try again.",
        });
        return null;
      }
      
      toast({
        title: "Reference Image Uploaded",
        description: "Your reference image has been uploaded successfully!",
      });
      
      return publicUrl.publicUrl;
    } catch (error: any) {
      console.error("💥 Reference image upload error:", error);
      
      let errorMessage = "Failed to upload reference image";
      if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes("auth")) {
        errorMessage = "Authentication error. Please sign in and try again.";
      }
      
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: errorMessage,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    referenceImage,
    setReferenceImage,
    uploadReferenceImage,
    uploading
  };
};
