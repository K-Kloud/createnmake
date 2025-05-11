
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  isZoomed: boolean;
  zoomFactor: number;
  onZoomIn: (e: React.MouseEvent) => void;
  onZoomOut: (e: React.MouseEvent) => void;
}

export const ZoomControls = ({
  isZoomed,
  zoomFactor,
  onZoomIn,
  onZoomOut
}: ZoomControlsProps) => {
  if (!isZoomed) return null;
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      <Button 
        variant="secondary" 
        size="sm"
        onClick={onZoomOut}
        className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
      >
        <ZoomOut size={16} />
        Zoom Out
      </Button>
      <Button 
        variant="secondary" 
        size="sm"
        onClick={onZoomIn}
        className="text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
      >
        <ZoomIn size={16} />
        Zoom In ({zoomFactor}x)
      </Button>
    </div>
  );
};
