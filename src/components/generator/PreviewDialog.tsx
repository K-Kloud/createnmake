
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyPreview } from "./preview/EmptyPreview";
import { GeneratingState } from "./preview/GeneratingState";
import { ImagePreview } from "./preview/ImagePreview";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  selectedRatio: string;
  generatedImageUrl?: string;
  prompt: string;
  onLike: (imageId: number) => void;
}

export const PreviewDialog = ({
  open,
  onOpenChange,
  isGenerating,
  selectedRatio,
  generatedImageUrl,
  prompt,
  onLike
}: PreviewDialogProps) => {
  console.log("🎬 PreviewDialog props:", {
    open,
    isGenerating,
    selectedRatio,
    hasGeneratedImageUrl: !!generatedImageUrl,
    generatedImageUrl,
    prompt
  });

  const renderContent = () => {
    if (isGenerating) {
      console.log("⏳ Rendering generating state");
      return <GeneratingState selectedRatio={selectedRatio} />;
    }
    
    if (generatedImageUrl) {
      console.log("🖼️ Rendering image preview with URL:", generatedImageUrl);
      return (
        <ImagePreview
          imageUrl={generatedImageUrl}
          prompt={prompt}
          onLike={onLike}
        />
      );
    }
    
    console.log("📭 Rendering empty preview");
    return <EmptyPreview selectedRatio={selectedRatio} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
