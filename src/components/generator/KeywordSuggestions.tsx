
import { Badge } from "@/components/ui/badge";
import { keywordSuggestions } from "./keywordSuggestions.data";

interface KeywordSuggestionsProps {
  selectedItem: string;
  onKeywordClick: (keyword: string) => void;
  disabled?: boolean; // Add optional disabled prop
}

export const KeywordSuggestions = ({ selectedItem, onKeywordClick, disabled }: KeywordSuggestionsProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-center text-white/60">Suggested keywords:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {keywordSuggestions[selectedItem]?.map((keyword) => (
          <Badge
            key={keyword}
            variant="secondary"
            className={`cursor-pointer hover:bg-primary/20 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => !disabled && onKeywordClick(keyword)}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
};
