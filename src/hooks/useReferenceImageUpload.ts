
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useReferenceImageUpload = () => {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const { toast } = useToast();

  const uploadReferenceImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    try {
      // Check if reference-images bucket exists, create if it doesn't
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some(bucket => bucket.name === "reference-images")) {
        await supabase.storage.createBucket("reference-images", {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
      }
      
      // Upload reference image to storage if provided
      const { data, error } = await supabase.storage
        .from("reference-images")
        .upload(`${Date.now()}-${file.name}`, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        console.error("Reference image upload error:", error);
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: `Failed to upload reference image: ${error.message}`,
        });
        return null;
      }
      
      // Get public URL for the uploaded reference image
      const { data: publicUrl } = supabase.storage
        .from("reference-images")
        .getPublicUrl(data.path);
        
      return publicUrl.publicUrl;
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "Failed to upload image",
      });
      return null;
    }
  };

  return {
    referenceImage,
    setReferenceImage,
    uploadReferenceImage
  };
};
