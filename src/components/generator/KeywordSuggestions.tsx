
import { Badge } from "@/components/ui/badge";
import { keywordSuggestions } from "./keywordSuggestions.data";

interface KeywordSuggestionsProps {
  selectedItem: string;
  onKeywordClick: (keyword: string) => void;
  disabled?: boolean;
}

export const KeywordSuggestions = ({ selectedItem, onKeywordClick, disabled }: KeywordSuggestionsProps) => {
  // Check if we have keywords for the selected item, default to empty array if not
  const suggestions = keywordSuggestions[selectedItem] || [];
  
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
          <p className="text-xs text-muted-foreground">No suggestions available for this item type</p>
        )}
      </div>
    </div>
  );
};
