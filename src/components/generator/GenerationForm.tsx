
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableItemSelect } from "./SearchableItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { PromptInput } from "./form/PromptInput";
import { GenerateButton } from "./form/GenerateButton";
import { UsageInfo } from "./form/UsageInfo";
import { ItemTypePreviews } from "./form/ItemTypePreviews";

import { EnhancedKeywordSuggestions } from "./EnhancedKeywordSuggestions";
import { ProviderSelect } from "./ProviderSelect";
import { ProviderRecommendation } from "./ProviderRecommendation";
import { ProviderComparison } from "./ProviderComparison";

interface GenerationFormProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedItem: string;
  onItemChange: (item: string) => void;
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
  referenceImage: File | null;
  onReferenceImageUpload: (file: File | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isSignedIn: boolean;
  remainingImages?: number;
  showItemPreviews?: boolean;
  provider?: string;
  uploadingReference?: boolean;
  onProviderChange?: (provider: string) => void;
}

export const GenerationForm = ({
  prompt,
  onPromptChange,
  selectedItem,
  onItemChange,
  selectedRatio,
  onRatioChange,
  referenceImage,
  onReferenceImageUpload,
  onGenerate,
  isGenerating,
  isSignedIn,
  remainingImages,
  showItemPreviews = false,
  provider = "openai",
  uploadingReference = false,
  onProviderChange,
}: GenerationFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleKeywordClick = (keyword: string) => {
    const currentPrompt = prompt.trim();
    const newPrompt = currentPrompt 
      ? `${currentPrompt}, ${keyword}` 
      : keyword;
    onPromptChange(newPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Main Generation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SearchableItemSelect
            value={selectedItem}
            onChange={onItemChange}
            disabled={isGenerating}
          />
          
          <AspectRatioSelect
            value={selectedRatio}
            onChange={onRatioChange}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-4">
          <ReferenceImageUpload
            onUpload={onReferenceImageUpload}
            file={referenceImage}
            disabled={isGenerating}
            uploading={uploadingReference}
          />
        </div>
      </div>

      {/* Prompt Input */}
      <PromptInput
        prompt={prompt}
        onPromptChange={onPromptChange}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        disabled={isGenerating}
      />

      {/* Enhanced Keyword Suggestions */}
      <EnhancedKeywordSuggestions
        selectedItem={selectedItem}
        onKeywordClick={handleKeywordClick}
        disabled={isGenerating}
      />

      {/* Advanced Options Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-white/60 hover:text-white"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </Button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <Card className="bg-black/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm">Advanced Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider Recommendation */}
            <ProviderRecommendation
              selectedItem={selectedItem}
              selectedRatio={selectedRatio}
              currentProvider={provider}
              onProviderChange={onProviderChange || (() => {})}
            />

            {/* Provider Selection */}
            <ProviderSelect
              value={provider}
              onChange={onProviderChange || (() => {})}
              disabled={isGenerating}
            />
            
            {/* Advanced Provider Comparison */}
            <ProviderComparison
              selectedProvider={provider}
              onProviderChange={onProviderChange || (() => {})}
              selectedItem={selectedItem}
              selectedRatio={selectedRatio}
            />
            
            {showItemPreviews && selectedItem && (
              <ItemTypePreviews selectedItem={selectedItem} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Info */}
      <UsageInfo 
        isSignedIn={isSignedIn} 
        remainingImages={remainingImages} 
      />

      {/* Generate Button */}
      <GenerateButton
        onClick={onGenerate}
        isGenerating={isGenerating}
        disabled={!selectedItem || !prompt.trim()}
        remainingImages={remainingImages}
      />
    </div>
  );
};
