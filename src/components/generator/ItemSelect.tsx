
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

// Transform the clothing items into a format suitable for the component
const clothingCategories = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "outerwear", label: "Outerwear" },
  { value: "suits", label: "Suits & Sets" },
  { value: "jumpsuits", label: "Jumpsuits & Rompers" },
  { value: "activewear", label: "Activewear & Swimwear" },
  { value: "undergarments", label: "Undergarments & Loungewear" },
  { value: "accessories", label: "Accessories" },
  { value: "footwear", label: "Footwear" },
  { value: "traditional", label: "Traditional & Cultural" },
  { value: "fashion-styles", label: "Fashion Styles" },
];

// Initial clothing types are the main categories that are always available
const initialItems = clothingCategories;

// Additional items for specific clothing items within categories
const additionalItems = [
  // Tops
  { value: "t-shirt", label: "T-Shirt" },
  { value: "blouse", label: "Blouse" },
  { value: "sweater", label: "Sweater" },
  { value: "cardigan", label: "Cardigan" },
  { value: "hoodie", label: "Hoodie" },
  
  // Bottoms
  { value: "jeans", label: "Jeans" },
  { value: "trousers", label: "Trousers" },
  { value: "skirt", label: "Skirt" },
  { value: "shorts", label: "Shorts" },
  { value: "leggings", label: "Leggings" },
  
  // Outerwear
  { value: "jacket", label: "Jacket" },
  { value: "coat", label: "Coat" },
  { value: "blazer", label: "Blazer" },
  { value: "parka", label: "Parka" },
  { value: "vest", label: "Vest" },
  
  // Dresses
  { value: "maxi-dress", label: "Maxi Dress" },
  { value: "cocktail-dress", label: "Cocktail Dress" },
  { value: "sundress", label: "Sundress" },
  { value: "sheath-dress", label: "Sheath Dress" },
  
  // Styles
  { value: "minimalist", label: "Minimalist" },
  { value: "bohemian", label: "Bohemian" },
  { value: "vintage", label: "Vintage" },
  { value: "streetwear", label: "Streetwear" },
  { value: "athleisure", label: "Athleisure" },
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
                {selectedItem ? selectedItem.label : "Select clothing type..."}
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
            <CommandInput placeholder="Search clothing type..." />
            <CommandEmpty>No clothing type found.</CommandEmpty>
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
