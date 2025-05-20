
import { Badge } from "@/components/ui/badge";
import { keywordSuggestions } from "./keywordSuggestions.data";
import { useEffect } from "react";

interface KeywordSuggestionsProps {
  selectedItem: string;
  onKeywordClick: (keyword: string) => void;
  disabled?: boolean;
}

export const KeywordSuggestions = ({ selectedItem, onKeywordClick, disabled }: KeywordSuggestionsProps) => {
  // Check if we have keywords for the selected item, default to empty array if not
  const suggestions = keywordSuggestions[selectedItem] || [];
  
  // Debug log to track selected item changes
  useEffect(() => {
    console.log('KeywordSuggestions - Selected item:', selectedItem);
    console.log('KeywordSuggestions - Has suggestions:', suggestions.length > 0);
  }, [selectedItem, suggestions]);
  
  return (
    <div className="space-y-2">
      <p className="text-sm text-center text-white/60">Suggested keywords:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.length > 0 ? (
          suggestions.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className={`cursor-pointer hover:bg-primary/20 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => !disabled && onKeywordClick(keyword)}
            >
              {keyword}
            </Badge>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            {selectedItem ? "No suggestions available for this item type" : "Select an item type to see suggestions"}
          </p>
        )}
      </div>
    </div>
  );
};
