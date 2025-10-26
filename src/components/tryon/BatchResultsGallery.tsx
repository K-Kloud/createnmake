import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VirtualTryOnSession } from "@/types/tryon";
import { Download, Share2, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TryOnResultDisplay } from "./TryOnResultDisplay";

interface BatchResultsGalleryProps {
  bodyImageUrl: string;
  results: VirtualTryOnSession[];
  onRegenerate?: (sessionId: number) => void;
  onDelete?: (sessionId: number) => void;
  onClose: () => void;
}

export const BatchResultsGallery = ({
  bodyImageUrl,
  results,
  onRegenerate,
  onDelete,
  onClose,
}: BatchResultsGalleryProps) => {
  const { toast } = useToast();
  const [selectedResult, setSelectedResult] = useState<VirtualTryOnSession | null>(null);

  const handleDownloadAll = async () => {
    toast({
      title: "Downloading all results...",
      description: "Your downloads will start shortly.",
    });

    for (const result of results) {
      if (result.tryon_result_url) {
        try {
          const response = await fetch(result.tryon_result_url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tryon-batch-${result.id}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error('Download failed for result:', result.id, error);
        }
      }
    }

    toast({
      title: "Downloads Complete",
      description: `${results.length} images downloaded successfully.`,
    });
  };

  const handleShareBatch = async () => {
    if (navigator.share && results.length > 0 && results[0].tryon_result_url) {
      try {
        await navigator.share({
          title: 'My Virtual Try-On Results',
          text: `Check out my ${results.length} virtual try-on results!`,
          url: results[0].tryon_result_url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      toast({
        title: "Share not available",
        description: "Sharing is not supported on this device.",
      });
    }
  };

  const successfulResults = results.filter(r => r.status === "completed" && r.tryon_result_url);

  return (
    <>
      <div className="space-y-6">
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <h3 className="text-xl font-bold mb-2">
            🎉 {successfulResults.length} of {results.length} Try-Ons Completed Successfully
          </h3>
          <p className="text-sm text-muted-foreground">
            Compare all your results below
          </p>
        </div>

        {/* Original Body Photo */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Original Reference Photo:</h4>
          <div className="w-full max-w-xs mx-auto rounded-lg overflow-hidden border">
            <img
              src={bodyImageUrl}
              alt="Your reference photo"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Try-On Results:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="group relative rounded-lg overflow-hidden border hover:border-primary transition-all cursor-pointer"
                onClick={() => setSelectedResult(result)}
              >
                {result.status === "completed" && result.tryon_result_url ? (
                  <>
                    <div className="aspect-square">
                      <img
                        src={result.tryon_result_url}
                        alt={`Try-on result ${result.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-sm font-medium">
                        View Full Size
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-muted">
                    <p className="text-sm text-muted-foreground">
                      {result.status === "failed" ? "Failed" : "Processing..."}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            disabled={successfulResults.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Download All ({successfulResults.length})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareBatch}
            disabled={successfulResults.length === 0}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Batch
          </Button>
          
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </div>

      {/* Full Size Result Dialog */}
      {selectedResult && selectedResult.tryon_result_url && (
        <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Try-On Result Details</DialogTitle>
            </DialogHeader>
            <TryOnResultDisplay
              originalImageUrl={bodyImageUrl}
              resultImageUrl={selectedResult.tryon_result_url}
              onRegenerate={onRegenerate ? () => onRegenerate(selectedResult.id) : undefined}
              isRegenerating={false}
              settings={selectedResult.settings}
            />
            <div className="flex gap-2 justify-end mt-4">
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onDelete(selectedResult.id);
                    setSelectedResult(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedResult(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
