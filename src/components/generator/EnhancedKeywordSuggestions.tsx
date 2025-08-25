
import { Badge } from "@/components/ui/badge";
import { clothingItems } from "@/data/clothingItems";
import { keywordSuggestions } from "./keywordSuggestions.data";
import { useEffect, useMemo } from "react";

interface EnhancedKeywordSuggestionsProps {
  selectedItem: string;
  onKeywordClick: (keyword: string) => void;
  disabled?: boolean;
}

export const EnhancedKeywordSuggestions = ({ 
  selectedItem, 
  onKeywordClick, 
  disabled 
}: EnhancedKeywordSuggestionsProps) => {
  // Get keywords from the clothing item data
  const selectedClothingItem = clothingItems.find(item => item.value === selectedItem);
  
  // Combine keywords from both sources
  const suggestions = useMemo(() => {
    const itemKeywords = selectedClothingItem?.keywords || [];
    const legacyKeywords = keywordSuggestions[selectedItem] || [];
    
    // Combine and deduplicate keywords
    const combined = [...new Set([...itemKeywords, ...legacyKeywords])];
    return combined.slice(0, 8); // Limit to 8 suggestions for better UX
  }, [selectedItem, selectedClothingItem]);
  
  // Debug log to track selected item changes
  useEffect(() => {
    console.log('EnhancedKeywordSuggestions - Selected item:', selectedItem);
    console.log('EnhancedKeywordSuggestions - Has suggestions:', suggestions.length > 0);
    console.log('EnhancedKeywordSuggestions - Suggestions:', suggestions);
  }, [selectedItem, suggestions]);
  
  if (!selectedItem) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-center text-white/60">Select an item type to see keyword suggestions</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <p className="text-sm text-center text-white/60">
        Suggested keywords for {selectedClothingItem?.label || selectedItem}:
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.length > 0 ? (
          suggestions.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className={`cursor-pointer hover:bg-primary/20 hover:text-primary-foreground transition-colors text-foreground bg-card border-border ${
                disabled ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => !disabled && onKeywordClick(keyword)}
            >
              {keyword}
            </Badge>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            No specific suggestions available for this item type
          </p>
        )}
      </div>
    </div>
  );
};
