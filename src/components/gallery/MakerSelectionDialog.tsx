import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const dummyArtisans = [
    { id: 1, name: "John's Crafts", specialty: "Wood carving", rating: 4.8 },
    { id: 2, name: "Maria's Workshop", specialty: "Pottery", rating: 4.9 },
    { id: 3, name: "Custom Creations", specialty: "Metal work", rating: 4.7 },
    { id: 4, name: "Artistic Touch", specialty: "Glass work", rating: 4.6 },
    { id: 5, name: "Handmade Haven", specialty: "Textile", rating: 4.8 }
  ];

  const dummyManufacturers = [
    { id: 1, name: "Quality Manufacturing Co.", type: "Industrial", capacity: "Large scale" },
    { id: 2, name: "Precision Products Ltd.", type: "Precision", capacity: "Medium scale" },
    { id: 3, name: "Global Manufacturing", type: "Multi-purpose", capacity: "Large scale" },
    { id: 4, name: "Tech Solutions Mfg.", type: "Electronics", capacity: "Medium scale" },
    { id: 5, name: "Innovative Industries", type: "Custom", capacity: "Small scale" }
  ];

  const handleManufacturerSelect = (manufacturerId: number) => {
    onMakerSelect('manufacturer');
    onOpenChange(false);
    navigate(`/manufacturer/${manufacturerId}`);
  };

  const handleArtisanSelect = (artisanId: number) => {
    onMakerSelect('artisan');
    onOpenChange(false);
    navigate(`/artisan/${artisanId}`);
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
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full p-6 h-auto flex flex-col gap-2"
              onClick={() => setSelectedType('artisan')}
            >
              <span className="text-lg font-semibold">Artisan</span>
              <span className="text-sm text-muted-foreground">
                Individual craftspeople and artists
              </span>
            </Button>
            {selectedType === 'artisan' && (
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {dummyArtisans.map((artisan) => (
                    <div
                      key={artisan.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleArtisanSelect(artisan.id)}
                    >
                      <div>
                        <h3 className="font-medium">{artisan.name}</h3>
                        <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
                      </div>
                      <span className="text-sm text-yellow-500">★ {artisan.rating}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full p-6 h-auto flex flex-col gap-2"
              onClick={() => setSelectedType('manufacturer')}
            >
              <span className="text-lg font-semibold">Manufacturer</span>
              <span className="text-sm text-muted-foreground">
                Professional manufacturing companies
              </span>
            </Button>
            {selectedType === 'manufacturer' && (
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {dummyManufacturers.map((manufacturer) => (
                    <div
                      key={manufacturer.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleManufacturerSelect(manufacturer.id)}
                    >
                      <div>
                        <h3 className="font-medium">{manufacturer.name}</h3>
                        <p className="text-sm text-muted-foreground">{manufacturer.type}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{manufacturer.capacity}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};