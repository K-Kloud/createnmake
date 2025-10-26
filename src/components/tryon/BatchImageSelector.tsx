import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BatchImageSelectorProps {
  onSelectionChange: (selectedImages: Array<{ id: number; url: string }>) => void;
  maxSelection?: number;
  disabled?: boolean;
}

interface GeneratedImage {
  id: number;
  image_url: string;
  prompt: string;
  created_at: string;
}

export const BatchImageSelector = ({
  onSelectionChange,
  maxSelection = 10,
  disabled = false,
}: BatchImageSelectorProps) => {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: images, isLoading } = useQuery({
    queryKey: ["generated-images-batch"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_images")
        .select("id, image_url, prompt, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as GeneratedImage[];
    },
  });

  useEffect(() => {
    if (!images) return;
    const selected = images
      .filter(img => selectedIds.has(img.id))
      .map(img => ({ id: img.id, url: img.image_url }));
    onSelectionChange(selected);
  }, [selectedIds, images, onSelectionChange]);

  const handleToggle = (id: number) => {
    if (disabled) return;

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (newSet.size >= maxSelection) {
          toast({
            variant: "destructive",
            title: "Maximum Selection Reached",
            description: `You can select up to ${maxSelection} items at once.`,
          });
          return prev;
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (disabled || !images) return;
    const allIds = images.slice(0, maxSelection).map(img => img.id);
    setSelectedIds(new Set(allIds));
  };

  const handleClearSelection = () => {
    if (disabled) return;
    setSelectedIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading your designs...</span>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No clothing designs available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generate some clothing designs first to use batch try-on.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Select Clothing Items</h3>
          <Badge variant={selectedIds.size > 0 ? "default" : "secondary"}>
            {selectedIds.size} / {maxSelection} selected
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || images.length === 0}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            disabled={disabled || selectedIds.size === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image) => {
          const isSelected = selectedIds.has(image.id);
          return (
            <div
              key={image.id}
              className={`relative group cursor-pointer rounded-lg border-2 transition-all overflow-hidden ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleToggle(image.id)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
                
                {/* Checkbox overlay */}
                <div className="absolute top-2 right-2 z-10">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-md border-2 ${
                    isSelected 
                      ? "bg-primary border-primary" 
                      : "bg-background/80 border-border backdrop-blur-sm"
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Prompt preview */}
              <div className="p-2 bg-muted/50 text-xs truncate">
                {image.prompt}
              </div>
            </div>
          );
        })}
      </div>

      {selectedIds.size > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>{selectedIds.size}</strong> item{selectedIds.size !== 1 ? 's' : ''} selected. 
            Each try-on will use the same body reference photo and settings.
          </p>
        </div>
      )}
    </div>
  );
};
