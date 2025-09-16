import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useProductDescription } from "@/hooks/useProductDescription";

interface ProductDescriptionProps {
  prompt: string;
  productType?: string;
  price?: string;
  creator?: string;
}

export const ProductDescription = ({ 
  prompt, 
  productType, 
  price, 
  creator 
}: ProductDescriptionProps) => {
  const { 
    description, 
    isLoading, 
    error, 
    regenerate, 
    hasGenerated 
  } = useProductDescription({
    prompt,
    productType,
    price,
    creator
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating compelling description...</span>
            </div>
          </div>
        )}
        
        <div className={`transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <p className="font-thin text-sm leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>

      {hasGenerated && (
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>AI-enhanced description</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerate}
            disabled={isLoading}
            className="text-xs h-7"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Regenerate
          </Button>
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          Failed to enhance description: {error}
        </div>
      )}
    </div>
  );
};