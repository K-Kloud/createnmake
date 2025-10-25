import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SampleImage {
  url: string;
  label: string;
  description: string;
}

const SAMPLE_IMAGES: SampleImage[] = [
  {
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop",
    label: "Professional Pose",
    description: "Full body, straight pose"
  },
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
    label: "Fashion Portrait",
    description: "Clear front view"
  },
  {
    url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop",
    label: "Casual Standing",
    description: "Natural relaxed pose"
  },
];

interface SampleImageSelectorProps {
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

export const SampleImageSelector = ({ onSelect, selectedUrl }: SampleImageSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Try with sample images to test the feature</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {SAMPLE_IMAGES.map((sample) => (
          <Card
            key={sample.url}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedUrl === sample.url ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onSelect(sample.url)}
          >
            <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
              <img
                src={sample.url}
                alt={sample.label}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-2 space-y-1">
              <div className="font-medium text-xs">{sample.label}</div>
              <div className="text-xs text-muted-foreground">{sample.description}</div>
            </div>
          </Card>
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => onSelect("")}
      >
        Clear Sample Selection
      </Button>
    </div>
  );
};
