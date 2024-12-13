import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Square, Smartphone, Monitor, LayoutGrid, Image } from "lucide-react";

const aspectRatios = {
  "square": { width: 1080, height: 1080, label: "Square (1:1)", icon: Square },
  "portrait": { width: 1080, height: 1350, label: "Portrait (4:5)", icon: Image },
  "landscape": { width: 1920, height: 1080, label: "Landscape (16:9)", icon: Monitor },
  "story": { width: 1080, height: 1920, label: "Story (9:16)", icon: Smartphone },
  "youtube": { width: 2560, height: 1440, label: "YouTube (16:9)", icon: Monitor },
  "facebook": { width: 1200, height: 630, label: "Facebook (1.91:1)", icon: LayoutGrid },
  "twitter": { width: 1600, height: 900, label: "Twitter (16:9)", icon: Monitor },
  "linkedin": { width: 1200, height: 627, label: "LinkedIn (1.91:1)", icon: LayoutGrid }
};

interface AspectRatioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const AspectRatioSelect = ({ value, onChange }: AspectRatioSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Output Size</label>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {Object.entries(aspectRatios).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[70px] 
              ${
                value === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card/30 hover:bg-card/50'
              }`}
          >
            <Icon className="w-4 h-4 mb-1" />
            <span className="text-xs text-center">{key}</span>
          </button>
        ))}
      </div>
      <p className="text-sm text-white/60">
        Size: {aspectRatios[value].width}x{aspectRatios[value].height}px
      </p>
    </div>
  );
};