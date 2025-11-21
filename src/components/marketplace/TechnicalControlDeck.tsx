import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { DataPointIcon, GridOverlayIcon } from "@/components/ui/fashion-icons";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface TechnicalControlDeckProps {
  onSearch: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onStyleChange?: (style: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
}

export const TechnicalControlDeck = ({
  onSearch,
  onCategoryChange,
  onSortChange,
  onStyleChange,
  onPriceRangeChange,
}: TechnicalControlDeckProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");

  const categories = [
    { id: "all", label: "ALL_ASSETS", icon: GridOverlayIcon },
    { id: "dress", label: "GARMENTS", icon: DataPointIcon },
    { id: "accessories", label: "ACCESSORIES", icon: DataPointIcon },
    { id: "footwear", label: "FOOTWEAR", icon: DataPointIcon },
  ];

  const sortOptions = [
    { id: "newest", label: "LATEST_UPLOAD" },
    { id: "most-liked", label: "TOP_RATED" },
    { id: "price-low", label: "PRICE_ASC" },
    { id: "price-high", label: "PRICE_DESC" },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
    if (value && !activeFilters.includes("search")) {
      setActiveFilters([...activeFilters, "search"]);
    } else if (!value && activeFilters.includes("search")) {
      setActiveFilters(activeFilters.filter(f => f !== "search"));
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
    if (category !== "all" && !activeFilters.includes("category")) {
      setActiveFilters([...activeFilters, "category"]);
    } else if (category === "all") {
      setActiveFilters(activeFilters.filter(f => f !== "category"));
    }
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSortChange(sort);
  };

  const handlePriceChange = (values: number[]) => {
    const range: [number, number] = [values[0], values[1]];
    setPriceRange(range);
    if (onPriceRangeChange) {
      onPriceRangeChange(range);
    }
    if (!activeFilters.includes("price")) {
      setActiveFilters([...activeFilters, "price"]);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSort("newest");
    setPriceRange([0, 1000]);
    setActiveFilters([]);
    onSearch("");
    onCategoryChange("all");
    onSortChange("newest");
    if (onPriceRangeChange) onPriceRangeChange([0, 1000]);
  };

  return (
    <div className="relative">
      {/* Control Deck Container */}
      <div className="bg-background/40 backdrop-blur-xl border border-border/50 rounded-lg p-4 shadow-2xl">
        {/* Technical Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs font-mono text-primary">CONTROL_DECK</div>
              <div className="text-[10px] font-mono text-muted-foreground">v2.8.4</div>
            </div>
          </div>
          
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs font-mono hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              CLEAR [{activeFilters.length}]
            </Button>
          )}
        </div>

        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Terminal */}
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-[10px] font-mono text-muted-foreground">SEARCH_QUERY</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Enter asset keywords..."
                className="pl-9 bg-background/50 border-border/50 font-mono text-sm h-9"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <Label className="text-[10px] font-mono text-muted-foreground">ASSET_TYPE</Label>
            <div className="flex gap-1">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "flex-1 text-[10px] font-mono h-9",
                    selectedCategory === cat.id
                      ? "bg-primary/20 text-primary border-primary/50"
                      : "bg-background/50 border-border/50"
                  )}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Algorithm */}
          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-[10px] font-mono text-muted-foreground">SORT_ALGORITHM</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background/50 border-border/50 font-mono text-xs h-9"
                >
                  {sortOptions.find(s => s.id === selectedSort)?.label || "SELECT"}
                  <SlidersHorizontal className="w-3 h-3 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-primary">SORT_PARAMETERS</div>
                  <RadioGroup value={selectedSort} onValueChange={handleSortChange}>
                    {sortOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="text-xs font-mono cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="mt-3 pt-3 border-t border-border/30">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-background/50 border-border/50 font-mono text-xs"
              >
                <DataPointIcon className="w-3 h-3 mr-2" />
                ADVANCED_PARAMETERS
                {activeFilters.includes("price") && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[9px]">
                    ACTIVE
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border-border/50">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-primary mb-3">PRICE_RANGE</div>
                  <div className="flex justify-between mb-2 text-xs font-mono">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={1000}
                    step={10}
                    className="mb-2"
                  />
                </div>

                {onStyleChange && (
                  <div>
                    <div className="text-xs font-mono text-primary mb-3">DESIGN_STYLE</div>
                    <RadioGroup defaultValue="all" onValueChange={onStyleChange}>
                      {["all", "minimalist", "vintage", "modern", "elegant"].map((style) => (
                        <div key={style} className="flex items-center space-x-2">
                          <RadioGroupItem value={style} id={`style-${style}`} />
                          <Label htmlFor={`style-${style}`} className="text-xs font-mono cursor-pointer uppercase">
                            {style}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Bar */}
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>SYSTEM_ONLINE</span>
          </div>
          <div className="flex gap-1">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="text-[9px] font-mono border-primary/30 text-primary"
              >
                {filter.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
