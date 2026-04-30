import { useState } from "react";
import { ChevronDown, Settings2, Sparkles, Maximize2, Layers, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { OutputSizeSelect } from "./OutputSizeSelect";

export type StylePreset =
  | "none"
  | "photorealistic"
  | "studio"
  | "editorial"
  | "minimalist"
  | "vintage"
  | "streetwear"
  | "luxury"
  | "cinematic";

export const STYLE_PRESETS: { value: StylePreset; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "No style modifier" },
  { value: "photorealistic", label: "Photorealistic", hint: "8K hyperrealism, sharp focus" },
  { value: "studio", label: "Studio", hint: "Pure white background, commercial shot" },
  { value: "editorial", label: "Editorial", hint: "High fashion magazine aesthetic" },
  { value: "minimalist", label: "Minimalist", hint: "Clean lines, neutral palette" },
  { value: "vintage", label: "Vintage", hint: "Retro tones, film grain" },
  { value: "streetwear", label: "Streetwear", hint: "Urban, graphic, bold" },
  { value: "luxury", label: "Luxury", hint: "Premium textures, lustrous sheen" },
  { value: "cinematic", label: "Cinematic", hint: "Volumetric light, dramatic" },
];

interface AdvancedSettingsPanelProps {
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
  outputSize: string;
  onOutputSizeChange: (size: string) => void;
  stylePreset: StylePreset;
  onStylePresetChange: (preset: StylePreset) => void;
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export const AdvancedSettingsPanel = ({
  selectedRatio,
  onRatioChange,
  outputSize,
  onOutputSizeChange,
  stylePreset,
  onStylePresetChange,
  batchSize,
  onBatchSizeChange,
  disabled,
  defaultOpen = false,
}: AdvancedSettingsPanelProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-between rounded-none border-border/60"
        >
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
            <Settings2 className="w-3.5 h-3.5" />
            Advanced Generator Settings
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">
        <Card className="border border-border/60 bg-card/40 rounded-none">
          <CardContent className="p-5 space-y-6">
            {/* Aspect ratio + Resolution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-label">
                  <Maximize2 className="w-3 h-3" />
                  <span>Aspect Ratio</span>
                </div>
                <AspectRatioSelect
                  value={selectedRatio}
                  onChange={onRatioChange}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-label">
                  <Layers className="w-3 h-3" />
                  <span>Resolution</span>
                </div>
                <OutputSizeSelect
                  value={outputSize}
                  onChange={onOutputSizeChange}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Style presets */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-label">
                <Palette className="w-3 h-3" />
                <span>Style Preset</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                {STYLE_PRESETS.map((preset) => {
                  const active = stylePreset === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => onStylePresetChange(preset.value)}
                      className={`text-left p-3 border transition-colors disabled:opacity-50 ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-background/40 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {active && <Sparkles className="w-3 h-3 text-primary" />}
                        <span className="font-mono text-xs uppercase tracking-wider">
                          {preset.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {preset.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Batch size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-label">Batch Size</Label>
                <span className="font-mono text-xs text-primary">
                  {batchSize} {batchSize === 1 ? "image" : "images"}
                </span>
              </div>
              <Slider
                value={[batchSize]}
                onValueChange={(v) => onBatchSizeChange(v[0])}
                min={1}
                max={4}
                step={1}
                disabled={disabled}
              />
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                Each image consumes 1 credit
              </p>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
