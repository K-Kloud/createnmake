
import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { clothingItems, clothingCategories, searchClothingItems, getItemsByCategory, getRecentlyUsedItems, type ClothingItem } from "@/data/clothingItems";

interface SearchableItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SearchableItemSelect = ({ value, onChange, disabled = false }: SearchableItemSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<string[]>(() => {
    const stored = localStorage.getItem('recent-clothing-items');
    return stored ? JSON.parse(stored) : [];
  });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected item details
  const selectedItem = clothingItems.find(item => item.value === value);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let items = searchQuery ? searchClothingItems(searchQuery) : clothingItems;
    
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  }, [searchQuery, selectedCategory]);

  // Group items by category for display
  const groupedItems = useMemo(() => {
    const grouped: Record<string, ClothingItem[]> = {};
    filteredItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filteredItems]);

  // Get recently used items
  const recentlyUsedItems = useMemo(() => {
    return getRecentlyUsedItems(recentItems);
  }, [recentItems]);

  // Focus search input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setOpen(false);
    setSearchQuery("");
    setSelectedCategory(null);
    
    // Update recent items
    const newRecent = [itemValue, ...recentItems.filter(v => v !== itemValue)].slice(0, 5);
    setRecentItems(newRecent);
    localStorage.setItem('recent-clothing-items', JSON.stringify(newRecent));
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Item Type</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[40px] p-3"
            disabled={disabled}
          >
            <div className="flex flex-wrap items-center gap-1 flex-1 text-left">
              {selectedItem ? (
                <div className="flex items-center gap-2 flex-1">
                  <Badge variant="secondary" className="text-xs">
                    {clothingCategories[selectedItem.category as keyof typeof clothingCategories]}
                  </Badge>
                  <span className="truncate">{selectedItem.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-auto"
                    onClick={clearSelection}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-muted-foreground">Select an item type...</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search clothing items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8"
              />
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          {!searchQuery && (
            <div className="p-3 border-b">
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {Object.entries(clothingCategories).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setSelectedCategory(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {/* Recently Used Items */}
              {!searchQuery && !selectedCategory && recentlyUsedItems.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Recently Used
                  </div>
                  {recentlyUsedItems.map((item) => (
                    <Button
                      key={item.value}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 text-left"
                      onClick={() => handleSelect(item.value)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="outline" className="text-xs">
                          {clothingCategories[item.category as keyof typeof clothingCategories]}
                        </Badge>
                        <span className="truncate">{item.label}</span>
                        {value === item.value && <Check className="ml-auto h-4 w-4" />}
                      </div>
                    </Button>
                  ))}
                  <Separator className="my-2" />
                </div>
              )}

              {/* Grouped Items */}
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {clothingCategories[category as keyof typeof clothingCategories]} ({items.length})
                  </div>
                  {items.map((item) => (
                    <Button
                      key={item.value}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 text-left"
                      onClick={() => handleSelect(item.value)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex flex-col items-start gap-1 flex-1">
                          <span className="truncate font-medium">{item.label}</span>
                          {item.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.keywords.slice(0, 3).map((keyword) => (
                                <Badge key={keyword} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {value === item.value && <Check className="ml-2 h-4 w-4" />}
                      </div>
                    </Button>
                  ))}
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No items found matching "{searchQuery}"
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
