
import { Button } from "@/components/ui/button";

interface MakerTypeButtonsProps {
  selectedType: "artisan" | "manufacturer";
  onSelectType: (type: "artisan" | "manufacturer") => void;
}

export const MakerTypeButtons = ({ selectedType, onSelectType }: MakerTypeButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant={selectedType === "artisan" ? "default" : "outline"}
        className="w-full p-6 h-auto flex flex-col gap-2"
        onClick={() => onSelectType("artisan")}
      >
        <span className="text-lg font-semibold">Artisan</span>
        <span className="text-sm text-muted-foreground">
          Individual craftspeople and artists
        </span>
      </Button>
      <Button
        variant={selectedType === "manufacturer" ? "default" : "outline"}
        className="w-full p-6 h-auto flex flex-col gap-2"
        onClick={() => onSelectType("manufacturer")}
      >
        <span className="text-lg font-semibold">Manufacturer</span>
        <span className="text-sm text-muted-foreground">
          Professional manufacturing companies
        </span>
      </Button>
    </div>
  );
};
