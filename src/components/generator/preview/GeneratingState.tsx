
import { Loader2 } from "lucide-react";

export const GeneratingState = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-muted-foreground">Generating your image...</p>
    </div>
  );
};
