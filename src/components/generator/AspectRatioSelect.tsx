
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Square, Smartphone, Monitor, LayoutGrid, Image, Scaling } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const aspectRatios = {
  "square": { width: 1080, height: 1080, label: "1:1", icon: Square },
  "portrait": { width: 1080, height: 1350, label: "4:5", icon: Image },
  "landscape": { width: 1920, height: 1080, label: "16:9", icon: Monitor },
  "story": { width: 1080, height: 1920, label: "9:16", icon: Smartphone },
  "youtube": { width: 2560, height: 1440, label: "16:9", icon: Monitor },
  "facebook": { width: 1200, height: 630, label: "1.91:1", icon: LayoutGrid },
  "twitter": { width: 1600, height: 900, label: "16:9", icon: Monitor },
  "linkedin": { width: 1200, height: 627, label: "1.91:1", icon: LayoutGrid }
};

interface AspectRatioSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const AspectRatioSelect = ({ value, onChange, disabled = false }: AspectRatioSelectProps) => {
  const selectedRatio = aspectRatios[value];
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Output Size</label>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Scaling className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select output aspect ratio</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Select 
          value={value} 
          onValueChange={onChange} 
          disabled={disabled}
        >
          <SelectTrigger className="w-full bg-card/30">
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(aspectRatios).map(([key, { label, icon: Icon }]) => (
                <SelectItem key={key} value={key} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-center text-white/60">
        Size: {selectedRatio.width}x{selectedRatio.height}px
      </p>
    </div>
  );
};
