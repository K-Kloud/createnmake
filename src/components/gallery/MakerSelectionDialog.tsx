import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MakerTypeButtons } from "./maker-selection/MakerTypeButtons";
import { ArtisanList } from "./maker-selection/ArtisanList";
import { ManufacturerList } from "./maker-selection/ManufacturerList";

interface MakerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMakerSelect: (type: 'artisan' | 'manufacturer') => void;
}

export const MakerSelectionDialog = ({
  open,
  onOpenChange,
  onMakerSelect,
}: MakerSelectionDialogProps) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'artisan' | 'manufacturer' | null>(null);

  const handleManufacturerSelect = (manufacturerId: string) => {
    onMakerSelect('manufacturer');
    onOpenChange(false);
    navigate(`/maker/${manufacturerId}?type=manufacturer`);
  };

  const handleArtisanSelect = (artisanId: string) => {
    onMakerSelect('artisan');
    onOpenChange(false);
    navigate(`/maker/${artisanId}?type=artisan`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Maker</DialogTitle>
          <DialogDescription>
            Select who you'd like to make this design
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <MakerTypeButtons onSelectType={setSelectedType} />
          
          {selectedType === 'artisan' && (
            <div className="mt-4">
              <ArtisanList onSelect={handleArtisanSelect} />
            </div>
          )}
          
          {selectedType === 'manufacturer' && (
            <div className="mt-4">
              <ManufacturerList onSelect={handleManufacturerSelect} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};