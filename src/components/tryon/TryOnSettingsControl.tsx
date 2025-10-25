import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TryOnSettings } from "@/types/tryon";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TryOnSettingsControlProps {
  settings: TryOnSettings;
  onChange: (settings: TryOnSettings) => void;
  disabled?: boolean;
}

export function TryOnSettingsControl({ settings, onChange, disabled }: TryOnSettingsControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = () => {
    onChange({
      fitAdjustment: 'regular',
      preserveBackground: true,
      enhanceQuality: true,
    });
  };

  const getSettingsSummary = () => {
    const fit = settings.fitAdjustment || 'regular';
    const quality = settings.enhanceQuality ? 'HD' : 'Standard';
    return `${fit.charAt(0).toUpperCase() + fit.slice(1)} Fit • ${quality} Quality`;
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <span>Advanced Settings</span>
          <span className="text-xs text-muted-foreground font-normal">
            ({getSettingsSummary()})
          </span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <TooltipProvider>
            {/* Fit Adjustment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Fit Adjustment</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs space-y-1">
                      <strong>Tight:</strong> Form-fitting style that shows body contours clearly. Best for athletic wear, fitted dresses.<br/>
                      <strong>Regular:</strong> Natural fit that follows your body shape. Recommended for most clothing types.<br/>
                      <strong>Loose:</strong> Relaxed, flowing fit with generous drape. Great for traditional wear, oversized styles.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={settings.fitAdjustment || 'regular'}
                onValueChange={(value) => onChange({ ...settings, fitAdjustment: value as 'tight' | 'regular' | 'loose' })}
                disabled={disabled}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tight" id="tight" />
                  <Label htmlFor="tight" className="font-normal cursor-pointer">Tight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="font-normal cursor-pointer">Regular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loose" id="loose" />
                  <Label htmlFor="loose" className="font-normal cursor-pointer">Loose</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Preserve Background */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="preserve-bg">Preserve Background</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      <strong>ON:</strong> Keeps your original photo background unchanged. Use this for realistic home try-ons.<br/>
                      <strong>OFF:</strong> Allows AI to adjust background for better composition. May improve overall image quality.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                id="preserve-bg"
                checked={settings.preserveBackground ?? true}
                onCheckedChange={(checked) => onChange({ ...settings, preserveBackground: checked })}
                disabled={disabled}
              />
            </div>

            {/* Enhance Quality */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="enhance-quality">Enhance Quality</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      <strong>ON:</strong> Ultra high-resolution output (8K). Best for professional use, printing, or detailed viewing. Takes longer.<br/>
                      <strong>OFF:</strong> High-quality output. Faster generation, perfect for quick previews and social sharing.
                    </p>
                  </TooltipContent>
                </Tooltip>
                {settings.enhanceQuality && (
                  <span className="text-xs text-muted-foreground">(adds 15-20s)</span>
                )}
              </div>
              <Switch
                id="enhance-quality"
                checked={settings.enhanceQuality ?? true}
                onCheckedChange={(checked) => onChange({ ...settings, enhanceQuality: checked })}
                disabled={disabled}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
                className="text-xs"
              >
                Reset to Defaults
              </Button>
            </div>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
