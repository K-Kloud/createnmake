import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  prompt: string;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  imageId?: number;
  userId?: string;
}

export const ImagePreviewDialog = ({
  open,
  onOpenChange,
  imageUrl,
  prompt,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  imageId,
  userId
}: ImagePreviewDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!imageId || !userId) {
      toast({
        title: "Error",
        description: "Cannot delete this image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative">
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full object-contain transition-transform duration-200 rounded-lg"
            style={{ transform: `scale(${zoomLevel})` }}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onZoomOut}
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            {userId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};