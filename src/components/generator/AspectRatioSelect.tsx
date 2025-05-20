
import { cn } from "@/lib/utils";

const aspects = [
  { 
    value: "square", 
    label: "1:1", 
    className: "aspect-square" 
  },
  { 
    value: "portrait", 
    label: "3:4", 
    className: "aspect-[3/4]" 
  },
  { 
    value: "landscape", 
    label: "4:3", 
    className: "aspect-[4/3]" 
  },
];

interface AspectRatioSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const AspectRatioSelect = ({ 
  value, 
  onChange,
  disabled = false
}: AspectRatioSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Aspect Ratio</label>
      <div className="grid grid-cols-3 gap-2">
        {aspects.map((aspect) => (
          <div
            key={aspect.value}
            className={cn(
              "cursor-pointer rounded-md border-2 transition-all",
              aspect.value === value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && onChange(aspect.value)}
          >
            <div className="p-2">
              <div
                className={cn(
                  "bg-muted rounded",
                  aspect.className
                )}
              />
              <p className="text-xs mt-1 text-center">{aspect.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
