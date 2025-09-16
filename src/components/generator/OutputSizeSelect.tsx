import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
interface OutputSizeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
const outputSizes = [{
  value: "512x512",
  label: "Square (512×512)",
  description: "Perfect for avatars and icons"
}, {
  value: "768x768",
  label: "Large Square (768×768)",
  description: "High-quality square images"
}, {
  value: "512x768",
  label: "Portrait (512×768)",
  description: "Vertical orientation"
}, {
  value: "768x512",
  label: "Landscape (768×512)",
  description: "Horizontal orientation"
}, {
  value: "1024x768",
  label: "HD Landscape (1024×768)",
  description: "High-definition horizontal"
}, {
  value: "768x1024",
  label: "HD Portrait (768×1024)",
  description: "High-definition vertical"
}, {
  value: "1024x1024",
  label: "Large Square (1024×1024)",
  description: "High-quality large format"
}];
export const OutputSizeSelect = ({
  value,
  onChange,
  disabled
}: OutputSizeSelectProps) => {
  return;
};