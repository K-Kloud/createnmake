import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const aspectRatios = {
  "square": { width: 1080, height: 1080, label: "Square (1:1)" },
  "portrait": { width: 1080, height: 1350, label: "Portrait (4:5)" },
  "landscape": { width: 1920, height: 1080, label: "Landscape (16:9)" },
  "story": { width: 1080, height: 1920, label: "Story (9:16)" },
  "youtube": { width: 2560, height: 1440, label: "YouTube (16:9)" },
  "facebook": { width: 1200, height: 630, label: "Facebook (1.91:1)" },
  "twitter": { width: 1600, height: 900, label: "Twitter (16:9)" },
  "linkedin": { width: 1200, height: 627, label: "LinkedIn (1.91:1)" }
};

interface AspectRatioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const AspectRatioSelect = ({ value, onChange }: AspectRatioSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Output Size</label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full bg-card/30 border-white/10">
          <SelectValue placeholder="Choose aspect ratio" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Common Sizes</SelectLabel>
            {Object.entries(aspectRatios).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="text-sm text-white/60">
        Size: {aspectRatios[value].width}x{aspectRatios[value].height}px
      </p>
    </div>
  );
};