
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Minimize, Eye, EyeOff, X, Download, Share2 } from "lucide-react";
import { KeyboardShortcutsButton } from "./KeyboardShortcutsHelp";
import { QuickAddToCollection } from "@/components/collections/QuickAddToCollection";

interface PreviewControlsProps {
  isMaximized: boolean;
  isPromptVisible: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMaximized: () => void;
  onTogglePrompt: () => void;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  hasDownloadActions?: boolean;
  imageId?: number;
  imageUrl?: string;
}

export const PreviewControls = ({
  isMaximized,
  isPromptVisible,
  onZoomIn,
  onZoomOut,
  onToggleMaximized,
  onTogglePrompt,
  onClose,
  onDownload,
  onShare,
  hasDownloadActions = false,
  imageId,
  imageUrl
}: PreviewControlsProps) => {
  return (
    <div className="absolute top-2 right-2 flex flex-wrap gap-2">
      <Button variant="secondary" size="icon" onClick={onZoomIn} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
        <ZoomIn className="h-4 w-4" />
        <span className="sr-only">Zoom In</span>
      </Button>
      <Button variant="secondary" size="icon" onClick={onZoomOut} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
        <ZoomOut className="h-4 w-4" />
        <span className="sr-only">Zoom Out</span>
      </Button>
      <Button variant="secondary" size="icon" onClick={onToggleMaximized} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
        {isMaximized ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        <span className="sr-only">{isMaximized ? 'Exit Full Screen' : 'Full Screen'}</span>
      </Button>
      <Button variant="secondary" size="icon" onClick={onTogglePrompt} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
        {isPromptVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">{isPromptVisible ? 'Hide' : 'Show'} Prompt</span>
      </Button>
      <KeyboardShortcutsButton />
      
      {imageId && (
        <QuickAddToCollection imageId={imageId} imageUrl={imageUrl} variant="ghost" size="icon" showLabel={false} />
      )}
      
      {hasDownloadActions && (
        <>
          {onDownload && (
            <Button variant="secondary" size="icon" onClick={onDownload} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          )}
          {onShare && (
            <Button variant="secondary" size="icon" onClick={onShare} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          )}
        </>
      )}
      
      <Button variant="secondary" size="icon" onClick={onClose} className="bg-background/80 backdrop-blur-sm hover:bg-background/60">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
};
