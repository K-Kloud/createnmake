import { AlertCircle, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  suggestions?: string[];
}

export const ErrorState = ({ error, onRetry, suggestions = [] }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center w-full">
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertCircle className="size-12 text-destructive" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-medium">Generation Failed</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg max-w-md space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HelpCircle className="size-4" />
            <span>Suggestions:</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 text-left list-disc list-inside">
            {suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {onRetry && (
        <Button onClick={onRetry} variant="default" className="gap-2">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};
