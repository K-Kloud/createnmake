import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { Loader2 } from "lucide-react";
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
    if (!generatedImageUrl) return;

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!generatedImageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my generated image!',
          text: 'I created this image using AI',
          url: generatedImageUrl
        });
        
        toast({
          title: "Success",
          description: "Image shared successfully",
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast({
            title: "Error",
            description: "Failed to share image",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(generatedImageUrl);
        toast({
          title: "Success",
          description: "Image URL copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy image URL",
          variant: "destructive",
        });
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
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex items-center gap-2"
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