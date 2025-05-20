
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
import { keywordSuggestions } from "./keywordSuggestions.data";

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

// Combine all items for immediate availability
const allItems = [...initialItems, ...additionalItems];

// Ensure all item values have an entry in the keywordSuggestions
const validateItemsInSuggestions = () => {
  const missingSuggestions = allItems.filter(item => !keywordSuggestions[item.value]);
  
  if (missingSuggestions.length > 0) {
    console.warn('Missing keyword suggestions for:', missingSuggestions.map(item => item.value));
  }
};

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  validateItemsInSuggestions();
}

interface ItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ItemSelect = ({ value, onChange, disabled = false, isLoading = false }: ItemSelectProps) => {
  const [open, setOpen] = useState(false);
  // Initialize with all items already included
  const [items] = useState(allItems);
  const [loading, setLoading] = useState(false);

  // For animation purposes only
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setLoading(true);
      // Simulate API delay with proper cleanup
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  };

  const selectedItem = items.find((item) => item.value === value);

  // Debug log to track selection
  useEffect(() => {
    if (value) {
      console.log('Selected item:', value, selectedItem || 'Item not found in options');
    }
  }, [value, selectedItem]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Item Type</label>
      <Popover open={open} onOpenChange={handleOpenChange}>
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
                {selectedItem ? selectedItem.label : "Select item type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0 z-50 shadow-lg border border-white/10 bg-popover" 
          align="start"
          sideOffset={5}
        >
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
                    value={item.value}
                    onSelect={(currentValue) => {
                      console.log('Item selected:', currentValue);
                      onChange(currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
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
