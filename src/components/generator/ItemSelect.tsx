
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ItemSelect = ({ value, onChange, disabled = false }: ItemSelectProps) => {
  // Available clothing items
  const clothingItems = [
    { value: "tops", label: "Tops" },
    { value: "bottoms", label: "Bottoms" },
    { value: "dresses", label: "Dresses" },
    { value: "outerwear", label: "Outerwear" },
    { value: "suits", label: "Suits & Formal Wear" },
    { value: "jumpsuits", label: "Jumpsuits & Rompers" },
  ];

  // Additional clothing items
  const additionalItems = [
    { value: "activewear", label: "Activewear" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
    { value: "traditional", label: "Traditional Clothing" },
  ];

  // Fashion styles
  const fashionStyles = [
    { value: "minimalist", label: "Minimalist" },
    { value: "bohemian", label: "Bohemian" },
    { value: "vintage", label: "Vintage" },
    { value: "streetwear", label: "Streetwear" },
    { value: "gothic", label: "Gothic" },
    { value: "punk", label: "Punk" },
    { value: "preppy", label: "Preppy" },
  ];

  // Add a general product category for non-clothing items
  const generalItems = [
    { value: "product", label: "General Product" },
    { value: "furniture", label: "Furniture" },
    { value: "interior", label: "Interior Design" },
    { value: "textile", label: "Textile" },
  ];

  // Combine all items
  const allItems = [
    ...clothingItems,
    ...additionalItems,
    ...fashionStyles,
    ...generalItems
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Item Type</label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an item type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Clothing</SelectLabel>
            {clothingItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Additional Items</SelectLabel>
            {additionalItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Fashion Styles</SelectLabel>
            {fashionStyles.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Other Products</SelectLabel>
            {generalItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
