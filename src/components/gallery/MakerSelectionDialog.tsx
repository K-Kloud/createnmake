import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MakerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMakerSelect: (type: 'artisan' | 'manufacturer') => void;
}

interface Artisan {
  id: string;
  business_name: string;
  specialties: string[];
  avatar_url?: string;
  rating?: number;
}

interface Manufacturer {
  id: string;
  business_name: string;
  business_type: string;
  specialties: string[];
}

export const MakerSelectionDialog = ({
  open,
  onOpenChange,
  onMakerSelect,
}: MakerSelectionDialogProps) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'artisan' | 'manufacturer' | null>(null);

  const { data: artisans, isLoading: isLoadingArtisans } = useQuery({
    queryKey: ['artisans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, business_name, specialties, avatar_url')
        .eq('is_artisan', true);

      if (error) {
        console.error('Error fetching artisans:', error);
        return [];
      }
      return data as Artisan[];
    },
    enabled: selectedType === 'artisan'
  });

  const { data: manufacturers, isLoading: isLoadingManufacturers } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, business_name, business_type, specialties')
        .eq('is_verified', true);

      if (error) {
        console.error('Error fetching manufacturers:', error);
        return [];
      }
      return data as Manufacturer[];
    },
    enabled: selectedType === 'manufacturer'
  });

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
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
                {isLoadingArtisans ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : artisans && artisans.length > 0 ? (
                  <div className="space-y-4">
                    {artisans.map((artisan) => (
                      <div
                        key={artisan.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleArtisanSelect(artisan.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={artisan.avatar_url} alt={artisan.business_name} />
                            <AvatarFallback>{getInitials(artisan.business_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{artisan.business_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {artisan.specialties?.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No artisans found
                  </p>
                )}
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
                {isLoadingManufacturers ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : manufacturers && manufacturers.length > 0 ? (
                  <div className="space-y-4">
                    {manufacturers.map((manufacturer) => (
                      <div
                        key={manufacturer.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleManufacturerSelect(manufacturer.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(manufacturer.business_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{manufacturer.business_name}</h3>
                            <p className="text-sm text-muted-foreground">{manufacturer.business_type}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {manufacturer.specialties?.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No manufacturers found
                  </p>
                )}
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};