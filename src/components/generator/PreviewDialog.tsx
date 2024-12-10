import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  selectedRatio: string;
  generatedImageUrl?: string;
}

export const PreviewDialog = ({ 
  open, 
  onOpenChange, 
  isGenerating,
  selectedRatio,
  generatedImageUrl 
}: PreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generated Image Preview</DialogTitle>
        </DialogHeader>
        <div 
          className="bg-card/50 rounded-lg flex items-center justify-center min-h-[400px]"
        >
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Generating your image...</p>
            </div>
          ) : generatedImageUrl ? (
            <img 
              src={generatedImageUrl} 
              alt="Generated preview" 
              className="rounded-lg max-h-[600px] object-contain"
            />
          ) : (
            <p className="text-muted-foreground">Preview will appear here</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};