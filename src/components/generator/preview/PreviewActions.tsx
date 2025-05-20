
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePreviewDialog } from "./usePreviewDialog";

interface PreviewActionsProps {
  generatedImageUrl?: string;
}

export const PreviewActions = ({ generatedImageUrl }: PreviewActionsProps) => {
  const { toast } = useToast();
  const { handleDownload, handleShare } = usePreviewDialog();
  
  return (
    <div className="flex gap-2 mt-4">
      <Button
        onClick={() => generatedImageUrl && handleDownload(generatedImageUrl)}
        variant="outline"
        className="flex items-center gap-2"
        disabled={!generatedImageUrl}
      >
        <Download className="w-4 h-4" />
        Download
      </Button>
      <Button
        onClick={() => generatedImageUrl && handleShare(generatedImageUrl)}
        variant="outline"
        className="flex items-center gap-2"
        disabled={!generatedImageUrl}
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    </div>
  );
};
