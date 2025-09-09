
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableItemSelect } from "./SearchableItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { MultipleReferenceUpload } from "./MultipleReferenceUpload";
import { ReferenceTypeSelector, ReferenceType } from "./ReferenceTypeSelector";
import { ReferenceProcessingOptionsComponent, ReferenceProcessingOptions } from "./ReferenceProcessingOptions";
import { AdvancedFeaturesInfo } from "./AdvancedFeaturesInfo";
import { useReferenceImageAnalysis } from "@/hooks/useReferenceImageAnalysis";
import { useSmartProviderFallback } from "@/hooks/useSmartProviderFallback";
import { generateEnhancedPromptFromAnalysis } from "@/services/imageAnalysis";
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
  referenceImages?: File[];
  onReferenceImagesChange?: (files: File[]) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isSignedIn: boolean;
  remainingImages?: number;
  showItemPreviews?: boolean;
  provider?: string;
  uploadingReference?: boolean;
  onProviderChange?: (provider: string) => void;
  useMultipleReferences?: boolean;
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
  referenceImages = [],
  onReferenceImagesChange,
  onGenerate,
  isGenerating,
  isSignedIn,
  remainingImages,
  showItemPreviews = false,
  provider = "openai",
  uploadingReference = false,
  onProviderChange,
  useMultipleReferences = false,
}: GenerationFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [referenceType, setReferenceType] = useState<ReferenceType>('style');
  const [processingOptions, setProcessingOptions] = useState<ReferenceProcessingOptions>({
    extractColors: true,
    analyzeStyle: true,
    detectObjects: true,
    analyzeComposition: true,
    extractTexture: true
  });

  const { analyzing, analysis, analyzeImage } = useReferenceImageAnalysis();
  const hasAnyReference = !!(referenceImage || referenceImages.length > 0);
  const { getRecommendedProvider } = useSmartProviderFallback(provider, hasAnyReference);

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
          {useMultipleReferences ? (
            <MultipleReferenceUpload
              files={referenceImages}
              onFilesChange={onReferenceImagesChange || (() => {})}
              disabled={isGenerating}
              maxFiles={3}
            />
          ) : (
            <ReferenceImageUpload
              onUpload={onReferenceImageUpload}
              file={referenceImage}
              disabled={isGenerating}
              uploading={uploadingReference}
            />
          )}
          
          {/* Reference Type Selection */}
          <ReferenceTypeSelector
            selectedType={referenceType}
            onTypeChange={setReferenceType}
            hasReferenceImages={hasAnyReference}
          />
          
          {/* Advanced Features Info */}
          <AdvancedFeaturesInfo isMultiMode={useMultipleReferences} />
          
          {/* Reference Processing Options */}
          <ReferenceProcessingOptionsComponent
            options={processingOptions}
            onOptionsChange={setProcessingOptions}
            hasReferenceImage={hasAnyReference}
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
              hasReferenceImage={hasAnyReference}
            />
            
            {/* Advanced Provider Comparison */}
            <ProviderComparison
              selectedProvider={provider}
              onProviderChange={onProviderChange || (() => {})}
              selectedItem={selectedItem}
              selectedRatio={selectedRatio}
            />
            
            {/* Reference Image Processing Analysis */}
            {hasAnyReference && analysis && (
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs text-muted-foreground">
                    Analysis Results ({referenceType})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs">
                    <span className="font-medium">Style:</span> {analysis.style}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Colors:</span> {analysis.dominantColors.slice(0, 3).join(", ")}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Objects:</span> {analysis.objects.join(", ")}
                  </div>
                  {useMultipleReferences && referenceImages.length > 1 && (
                    <div className="text-xs">
                      <span className="font-medium">References:</span> {referenceImages.length} images
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
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
