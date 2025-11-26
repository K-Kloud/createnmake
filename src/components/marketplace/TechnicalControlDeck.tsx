import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, HelpCircle } from "lucide-react";
import { DataPointIcon, GridOverlayIcon } from "@/components/ui/fashion-icons";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <div className="relative">
        {/* Control Deck Container */}
        <div className="bg-background/40 backdrop-blur-xl border border-border/50 rounded-lg p-4 shadow-2xl">
          {/* Simplified Header */}
          <div className="flex items-center justify-between mb-4">
            {activeFilters.length > 0 && (
              <div className="flex gap-1">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="outline"
                    className="text-[9px] font-mono border-primary/30 text-primary capitalize"
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            )}
            
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs hover:text-destructive ml-auto"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Main Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 bg-background/50 border-border/50 text-sm h-10"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div className="md:col-span-4">
              <div className="flex gap-1">
                {categories.map((cat) => (
                  <Tooltip key={cat.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={cn(
                          "flex-1 text-xs h-10",
                          selectedCategory === cat.id
                            ? "bg-primary/20 text-primary border-primary/50"
                            : "bg-background/50 border-border/50"
                        )}
                      >
                        {cat.label === "ALL_ASSETS" ? "All" : cat.label.charAt(0) + cat.label.slice(1).toLowerCase()}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {cat.label === "ALL_ASSETS" ? "Show all product types" : `Filter by ${cat.label.toLowerCase()}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="md:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-background/50 border-border/50 text-xs h-10"
                  >
                    {sortOptions.find(s => s.id === selectedSort)?.label.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') || "Sort"}
                    <SlidersHorizontal className="w-3 h-3 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 bg-background/95 backdrop-blur-xl border-border/50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sort by</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Choose how products are ordered</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <RadioGroup value={selectedSort} onValueChange={handleSortChange}>
                      {sortOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="text-sm cursor-pointer">
                            {option.label.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
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
                  className="bg-background/50 border-border/50 text-xs"
                >
                  <SlidersHorizontal className="w-3 h-3 mr-2" />
                  More Filters
                  {activeFilters.includes("price") && (
                    <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[9px]">
                      Active
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border-border/50">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium">Price Range</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Filter products by price range</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex justify-between mb-2 text-xs">
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
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium">Design Style</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Filter by aesthetic style</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <RadioGroup defaultValue="all" onValueChange={onStyleChange}>
                        {["all", "minimalist", "vintage", "modern", "elegant"].map((style) => (
                          <div key={style} className="flex items-center space-x-2">
                            <RadioGroupItem value={style} id={`style-${style}`} />
                            <Label htmlFor={`style-${style}`} className="text-sm cursor-pointer capitalize">
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
        </div>
      </div>
    </TooltipProvider>
  );
};
