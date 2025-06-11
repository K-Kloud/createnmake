
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InpaintingCanvas } from './InpaintingCanvas';
import { useInpaintImage } from '@/hooks/useInpaintImage';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

interface InpaintingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  imageId: number;
  onImageEdited?: (newImageUrl: string, newImageId: number) => void;
}

export const InpaintingDialog: React.FC<InpaintingDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  imageId,
  onImageEdited
}) => {
  const [maskDataUrl, setMaskDataUrl] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const { toast } = useToast();
  
  const { mutate: inpaintImage, isPending: isInpainting } = useInpaintImage({
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your image has been edited successfully.",
      });
      onImageEdited?.(data.imageUrl, data.imageId);
      onOpenChange(false);
      // Reset form
      setMaskDataUrl('');
      setEditPrompt('');
    },
    onError: (error: any) => {
      console.error('Inpainting error:', error);
      toast({
        variant: "destructive",
        title: "Editing Failed",
        description: error.message || "Failed to edit image. Please try again.",
      });
    },
  });

  const handleInpaint = () => {
    if (!maskDataUrl) {
      toast({
        variant: "destructive",
        title: "No mask drawn",
        description: "Please draw on the image to mark the areas you want to edit.",
      });
      return;
    }

    if (!editPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "No edit prompt",
        description: "Please describe what you want to change in the selected areas.",
      });
      return;
    }

    inpaintImage({
      imageUrl,
      maskDataUrl,
      editPrompt: editPrompt.trim(),
      originalImageId: imageId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Edit Image with AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Use the brush tool to paint over areas you want to change</li>
              <li>Use the eraser to remove parts of your mask</li>
              <li>Describe what you want to change in the text box below</li>
              <li>Click "Apply Changes" to generate the edited image</li>
            </ol>
          </div>

          {/* Canvas */}
          <InpaintingCanvas
            imageUrl={imageUrl}
            onMaskChange={setMaskDataUrl}
            className="w-full"
          />

          {/* Edit prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Describe your changes
            </label>
            <Textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Describe what you want to change in the painted areas. For example: 'change the color to blue', 'add flowers', 'remove the background', etc."
              rows={3}
              disabled={isInpainting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isInpainting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInpaint}
              disabled={isInpainting || !maskDataUrl || !editPrompt.trim()}
            >
              {isInpainting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Editing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
