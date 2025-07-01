import { EnhancedKeywordSuggestions } from "./EnhancedKeywordSuggestions";

interface KeywordSuggestionsProps {
  selectedItem: string;
  onKeywordClick: (keyword: string) => void;
  disabled?: boolean;
}

export const KeywordSuggestions = ({ selectedItem, onKeywordClick, disabled }: KeywordSuggestionsProps) => {
  return (
    <EnhancedKeywordSuggestions 
      selectedItem={selectedItem} 
      onKeywordClick={onKeywordClick} 
      disabled={disabled} 
    />
  );
};
