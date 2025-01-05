import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a Maker</DialogTitle>
          <DialogDescription>
            Select who you'd like to make this design
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant="outline"
            className="p-6 h-auto flex flex-col gap-2"
            onClick={() => onMakerSelect('artisan')}
          >
            <span className="text-lg font-semibold">Artisan</span>
            <span className="text-sm text-muted-foreground">
              Individual craftspeople and artists
            </span>
          </Button>
          <Button
            variant="outline"
            className="p-6 h-auto flex flex-col gap-2"
            onClick={() => onMakerSelect('manufacturer')}
          >
            <span className="text-lg font-semibold">Manufacturer</span>
            <span className="text-sm text-muted-foreground">
              Professional manufacturing companies
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};