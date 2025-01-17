import { Badge } from "@/components/ui/badge";
import { keywordSuggestions } from "./keywordSuggestions.data";

interface KeywordSuggestionsProps {
  selectedItem: string;
  onKeywordClick: (keyword: string) => void;
}

export const KeywordSuggestions = ({ selectedItem, onKeywordClick }: KeywordSuggestionsProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-center text-white/60">Suggested keywords:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {keywordSuggestions[selectedItem]?.map((keyword) => (
          <Badge
            key={keyword}
            variant="secondary"
            className="cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => onKeywordClick(keyword)}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
};