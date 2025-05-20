
import { ImageIcon } from "lucide-react";

export const EmptyPreview = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <ImageIcon className="size-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-medium">No Image Generated Yet</h3>
        <p className="text-muted-foreground max-w-xs">
          Fill out the form and click 'Generate Design' to create your custom design.
        </p>
      </div>
    </div>
  );
};
