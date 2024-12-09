import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReferenceImageUploadProps {
  referenceImage: File | null;
  onUpload: (file: File | null) => void;
}

export const ReferenceImageUpload = ({ referenceImage, onUpload }: ReferenceImageUploadProps) => {
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
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

      onUpload(file);
      toast({
        title: "Image uploaded",
        description: "Your reference image has been uploaded successfully",
      });
    }
  };

  return (
    <div className="space-y-2 relative">
      <input
        type="file"
        id="imageUpload"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <label
        htmlFor="imageUpload"
        className="inline-flex items-center justify-center size-8 rounded-full bg-primary hover:bg-primary-hover text-white cursor-pointer transition-colors"
      >
        <Plus className="size-4" />
      </label>
      {referenceImage && (
        <p className="text-sm text-white/70">
          Reference image: {referenceImage.name}
        </p>
      )}
    </div>
  );
};