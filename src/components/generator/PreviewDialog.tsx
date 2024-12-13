import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!generatedImageUrl) {
      toast({
        title: "Error",
        description: "No image available to download",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!generatedImageUrl) {
      toast({
        title: "Error",
        description: "No image available to share",
        variant: "destructive",
      });
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my generated image!',
          text: 'I created this image using AI',
          url: generatedImageUrl
        });
        
        toast({
          title: "Success",
          description: "Image shared successfully",
        });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(generatedImageUrl);
        toast({
          title: "Success",
          description: "Image URL copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      if (error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share image. URL copied to clipboard instead.",
          variant: "destructive",
        });
        // Attempt to copy URL as fallback
        try {
          await navigator.clipboard.writeText(generatedImageUrl);
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generated Image Preview</DialogTitle>
        </DialogHeader>
        <div 
          className="bg-card/50 rounded-lg flex flex-col items-center justify-center min-h-[400px] gap-4"
        >
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Generating your image...</p>
            </div>
          ) : generatedImageUrl ? (
            <>
              <img 
                src={generatedImageUrl} 
                alt="Generated preview" 
                className="rounded-lg max-h-[500px] object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                  toast({
                    title: "Error",
                    description: "Failed to load image",
                    variant: "destructive",
                  });
                }}
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!generatedImageUrl}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!generatedImageUrl}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Preview will appear here</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};