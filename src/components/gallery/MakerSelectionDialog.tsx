
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArtisanList } from "./maker-selection/ArtisanList";
import { ManufacturerList } from "./maker-selection/ManufacturerList";
import { MakerTypeButtons } from "./maker-selection/MakerTypeButtons";

interface MakerSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  imageId: number;
}

export const MakerSelectionDialog = ({
  open,
  onClose,
  imageId,
}: MakerSelectionDialogProps) => {
  const [selectedType, setSelectedType] = useState<"artisan" | "manufacturer">("artisan");
  const [selectedMakerId, setSelectedMakerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedMakerId(id);
  };

  const handleTypeChange = (type: "artisan" | "manufacturer") => {
    setSelectedType(type);
    setSelectedMakerId(null);
  };

  const handleSubmit = async () => {
    if (!selectedMakerId) return;
    
    // The actual update is now handled in the individual components
    // We just need to close the dialog after assignment
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign a maker</DialogTitle>
          <DialogDescription>
            Choose who should make this item
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <MakerTypeButtons 
            selectedType={selectedType} 
            onSelectType={handleTypeChange} 
          />
          
          <div className="mt-4">
            {selectedType === "artisan" ? (
              <ArtisanList 
                onSelect={handleSelect} 
                isSubmitting={isSubmitting}
                selectedId={selectedMakerId || undefined}
                imageId={imageId}
              />
            ) : (
              <ManufacturerList 
                onSelect={handleSelect} 
                isSubmitting={isSubmitting}
                selectedId={selectedMakerId || undefined}
                imageId={imageId}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedMakerId || isSubmitting}
          >
            {isSubmitting ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
