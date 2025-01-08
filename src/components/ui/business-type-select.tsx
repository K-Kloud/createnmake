import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { manufacturerCategories } from "@/data/manufacturerCategories";

interface BusinessTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const BusinessTypeSelect = ({ value, onChange }: BusinessTypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select business type" />
      </SelectTrigger>
      <SelectContent>
        {manufacturerCategories.map((category) => (
          <SelectItem key={category.id} value={category.name.toLowerCase()}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};