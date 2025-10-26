import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";

interface BatchProgressItem {
  url: string;
  status: "pending" | "processing" | "completed" | "failed";
  label: string;
}

interface BatchProgressDisplayProps {
  items: BatchProgressItem[];
  currentIndex: number;
  onCancel?: () => void;
  estimatedTimePerItem?: number; // in seconds
}

export const BatchProgressDisplay = ({
  items,
  currentIndex,
  onCancel,
  estimatedTimePerItem = 25,
}: BatchProgressDisplayProps) => {
  const completed = items.filter(item => item.status === "completed").length;
  const failed = items.filter(item => item.status === "failed").length;
  const total = items.length;
  const progress = (completed + failed) / total * 100;
  
  const remaining = total - completed - failed;
  const estimatedTimeRemaining = remaining * estimatedTimePerItem;
  const minutes = Math.floor(estimatedTimeRemaining / 60);
  const seconds = estimatedTimeRemaining % 60;

  const getStatusIcon = (status: BatchProgressItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case "pending":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: BatchProgressItem["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "processing":
        return "Processing...";
      case "pending":
        return "Pending";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Generating try-ons... {completed} of {total} completed
          </h3>
          {failed > 0 && (
            <span className="text-sm text-destructive">
              {failed} failed
            </span>
          )}
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          {remaining > 0 && (
            <span>
              Est. time remaining: {minutes > 0 ? `${minutes}m ` : ""}{seconds}s
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              item.status === "processing" 
                ? "border-primary bg-primary/5" 
                : "border-border"
            }`}
          >
            <div className="flex-shrink-0">
              {getStatusIcon(item.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.label}</p>
              <p className="text-xs text-muted-foreground">
                {getStatusText(item.status)}
              </p>
            </div>

            {item.status === "completed" && (
              <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden border">
                <img 
                  src={item.url} 
                  alt={item.label}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {onCancel && remaining > 0 && (
        <div className="flex justify-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={completed + failed === total}
          >
            Cancel Batch
          </Button>
        </div>
      )}

      {completed + failed === total && (
        <div className="p-4 rounded-lg bg-muted text-center">
          <p className="font-semibold">
            {failed === 0 
              ? "🎉 All try-ons completed successfully!" 
              : `✓ Batch complete: ${completed} succeeded, ${failed} failed`}
          </p>
        </div>
      )}
    </div>
  );
};
