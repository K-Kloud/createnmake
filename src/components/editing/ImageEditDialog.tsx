
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  RotateCcw, 
  Crop, 
  Download,
  Save,
  Undo2,
  Redo2
} from "lucide-react";

interface ImageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave?: (editedImageUrl: string) => void;
}

interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  scale: number;
}

export const ImageEditDialog = ({ 
  open, 
  onOpenChange, 
  imageUrl, 
  onSave 
}: ImageEditDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editState, setEditState] = useState<EditState>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    scale: 100,
  });
  const [history, setHistory] = useState<EditState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setOriginalImage(img);
        const initialState = {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          rotation: 0,
          scale: 100,
        };
        setEditState(initialState);
        setHistory([initialState]);
        setHistoryIndex(0);
      };
      img.src = imageUrl;
    }
  }, [open, imageUrl]);

  useEffect(() => {
    if (originalImage && canvasRef.current) {
      applyFilters();
    }
  }, [editState, originalImage]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !originalImage) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((editState.rotation * Math.PI) / 180);
    ctx.scale(editState.scale / 100, editState.scale / 100);
    ctx.translate(-originalImage.width / 2, -originalImage.height / 2);

    // Apply filters
    ctx.filter = `
      brightness(${editState.brightness}%) 
      contrast(${editState.contrast}%) 
      saturate(${editState.saturation}%)
    `;

    ctx.drawImage(originalImage, 0, 0);
    ctx.restore();
  };

  const updateEditState = (newState: Partial<EditState>) => {
    const updated = { ...editState, ...newState };
    setEditState(updated);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditState(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditState(history[newIndex]);
    }
  };

  const reset = () => {
    const resetState = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      scale: 100,
    };
    setEditState(resetState);
    setHistory([resetState]);
    setHistoryIndex(0);
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onSave?.(url);
        toast({
          title: "Image Edited",
          description: "Your edited image has been saved",
        });
        onOpenChange(false);
      }
    }, 'image/png');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Downloaded",
      description: "Edited image downloaded successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Edit Image
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* History Controls */}
            <div className="flex gap-2">
              <Button
                onClick={undo}
                disabled={historyIndex <= 0}
                variant="outline"
                size="sm"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                variant="outline"
                size="sm"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button onClick={reset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Filters */}
            <div className="space-y-4">
              <div>
                <Label>Brightness: {editState.brightness}%</Label>
                <Slider
                  value={[editState.brightness]}
                  onValueChange={([value]) => updateEditState({ brightness: value })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Contrast: {editState.contrast}%</Label>
                <Slider
                  value={[editState.contrast]}
                  onValueChange={([value]) => updateEditState({ contrast: value })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Saturation: {editState.saturation}%</Label>
                <Slider
                  value={[editState.saturation]}
                  onValueChange={([value]) => updateEditState({ saturation: value })}
                  min={0}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Rotation: {editState.rotation}°</Label>
                <Slider
                  value={[editState.rotation]}
                  onValueChange={([value]) => updateEditState({ rotation: value })}
                  min={-180}
                  max={180}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Scale: {editState.scale}%</Label>
                <Slider
                  value={[editState.scale]}
                  onValueChange={([value]) => updateEditState({ scale: value })}
                  min={25}
                  max={200}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={saveImage} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={downloadImage} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
