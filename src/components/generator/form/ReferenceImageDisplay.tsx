
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReferenceImageDisplayProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

export const ReferenceImageDisplay = ({ 
  file, 
  onRemove, 
  disabled = false 
}: ReferenceImageDisplayProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Reference Image</label>
      <div className="relative">
        <img 
          src={URL.createObjectURL(file)} 
          alt="Reference" 
          className="w-full rounded-md object-cover max-h-48"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
