
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Initial items that are always available
const initialItems = [
  { value: "product", label: "Product Design" },
  { value: "fashion", label: "Fashion Design" },
  { value: "furniture", label: "Furniture Design" },
  { value: "interior", label: "Interior Design" },
  { value: "accessory", label: "Accessory Design" },
  { value: "packaging", label: "Packaging Design" },
];

// Additional items that will be loaded dynamically
const additionalItems = [
  { value: "jewelry", label: "Jewelry Design" },
  { value: "footwear", label: "Footwear Design" },
  { value: "lighting", label: "Lighting Design" },
  { value: "textile", label: "Textile Design" },
  { value: "gadget", label: "Gadget Design" },
  { value: "homeware", label: "Homeware Design" },
  { value: "automotive", label: "Automotive Design" },
  { value: "toy", label: "Toy Design" },
];

interface ItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ItemSelect = ({ value, onChange, disabled = false, isLoading = false }: ItemSelectProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);

  // Simulate loading additional items when dropdown is opened
  useEffect(() => {
    if (open && items.length === initialItems.length) {
      setLoading(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        setItems([...initialItems, ...additionalItems]);
        setLoading(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [open, items.length]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Item Type</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-card/30"
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {value
                  ? items.find((item) => item.value === value)?.label || initialItems.find((item) => item.value === value)?.label
                  : "Select item type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search item type..." />
            <CommandEmpty>No item type found.</CommandEmpty>
            <CommandGroup>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                items.map((item) => (
                  <CommandItem
                    key={item.value}
                    onSelect={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
