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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MakerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMakerSelect: (type: 'artisan' | 'manufacturer') => void;
  generatedImage?: {
    id: number;
    url: string;
    prompt: string;
  };
}

export const MakerSelectionDialog = ({
  open,
  onOpenChange,
  onMakerSelect,
  generatedImage,
}: MakerSelectionDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'artisan' | 'manufacturer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManufacturerSelect = (manufacturerId: string) => {
    onMakerSelect('manufacturer');
    onOpenChange(false);
    navigate(`/maker/${manufacturerId}?type=manufacturer`);
  };

  const handleArtisanSelect = async (artisanId: string) => {
    if (!generatedImage) {
      onMakerSelect('artisan');
      onOpenChange(false);
      navigate(`/maker/${artisanId}?type=artisan`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit a quote request",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke('notify-artisan', {
        body: {
          artisanId,
          userId: session.user.id,
          productDetails: generatedImage.prompt,
          imageUrl: generatedImage.url,
        },
      });

      if (error) throw error;

      toast({
        title: "Quote Request Sent",
        description: "The artisan has been notified and will respond to your request soon.",
      });

      onMakerSelect('artisan');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending quote request:', error);
      toast({
        title: "Error",
        description: "Failed to send quote request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <ArtisanList onSelect={handleArtisanSelect} isSubmitting={isSubmitting} />
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