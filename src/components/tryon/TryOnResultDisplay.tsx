import { useState } from "react";
import { Download, RefreshCw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";

interface TryOnResultDisplayProps {
  originalImageUrl: string;
  resultImageUrl: string;
  onRegenerate?: () => void;
  onDownload?: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export const TryOnResultDisplay = ({
  originalImageUrl,
  resultImageUrl,
  onRegenerate,
  onDownload,
  isRegenerating,
  className,
}: TryOnResultDisplayProps) => {
  const [sliderValue, setSliderValue] = useState([50]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(resultImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `virtual-tryon-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onDownload?.();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Before/After Comparison */}
      <div className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden border border-border">
        {/* Before Image (Original) */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={originalImageUrl}
            alt="Original"
            className="w-full h-full object-cover"
          />
        </div>

        {/* After Image (Result) - clipped by slider */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `inset(0 ${100 - sliderValue[0]}% 0 0)`,
          }}
        >
          <OptimizedImage
            src={resultImageUrl}
            alt="Try-on result"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderValue[0]}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1 h-4 bg-gray-400 rounded" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
          Try-On
        </div>

        {/* Fullscreen Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Slider Control */}
      <div className="px-4">
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          max={100}
          step={1}
          className="cursor-pointer"
          aria-label="Comparison slider"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          variant="default"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Result
        </Button>
        {onRegenerate && (
          <Button
            onClick={onRegenerate}
            variant="outline"
            disabled={isRegenerating}
            className="flex-1"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRegenerating && "animate-spin")} />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
        <p>Drag the slider to compare the original photo with the try-on result</p>
      </div>
    </div>
  );
};
