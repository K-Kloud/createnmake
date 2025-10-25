import { useState } from "react";
import { useVirtualTryOn } from "@/hooks/useVirtualTryOn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trash2, Download, Image as ImageIcon, Sparkles } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { TryOnResultDisplay } from "./TryOnResultDisplay";
import { TryOnSettings } from "@/types/tryon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const TryOnGallery = () => {
  const { history, isLoadingHistory, deleteSession, isDeletingSession, generateTryOn, isGenerating } = useVirtualTryOn();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleView = (session: any) => {
    setSelectedSession(session);
    setViewDialogOpen(true);
  };

  const handleDelete = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this try-on session?")) {
      await deleteSession(sessionId);
    }
  };

  const handleRegenerate = async (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Regenerate logic here - not implementing full flow to keep it simple
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      processing: "secondary",
      failed: "destructive",
      pending: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Try-On Sessions Yet</h3>
        <p className="text-sm text-muted-foreground">
          Generate some fashion designs and try them on to see how they look!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((session) => (
          <Card
            key={session.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleView(session)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-[3/4]">
                <OptimizedImage
                  src={session.tryon_result_url || session.body_reference_url}
                  alt="Try-on result"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(session.status)}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Settings Badges */}
                {session.settings && (
                  <div className="flex flex-wrap gap-1.5">
                    {session.settings.fitAdjustment && (
                      <Badge variant="outline" className="text-xs">
                        {session.settings.fitAdjustment.charAt(0).toUpperCase()}{session.settings.fitAdjustment.slice(1)} Fit
                      </Badge>
                    )}
                    {session.settings.enhanceQuality && (
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        HD
                      </Badge>
                    )}
                  </div>
                )}
                
                {session.status === "completed" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(session.tryon_result_url, '_blank');
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleDelete(session.id, e)}
                      disabled={isDeletingSession}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {session.status === "failed" && session.error_message && (
                  <p className="text-xs text-destructive">
                    Error: {session.error_message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      {selectedSession && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Try-On Result</DialogTitle>
            </DialogHeader>
            {selectedSession.status === "completed" && selectedSession.tryon_result_url ? (
              <TryOnResultDisplay
                originalImageUrl={selectedSession.body_reference_url}
                resultImageUrl={selectedSession.tryon_result_url}
                settings={selectedSession.settings}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {selectedSession.status === "processing" && "Processing..."}
                  {selectedSession.status === "pending" && "Pending..."}
                  {selectedSession.status === "failed" && `Failed: ${selectedSession.error_message || "Unknown error"}`}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
