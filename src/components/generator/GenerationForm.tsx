import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { SearchableItemSelect } from "./SearchableItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { OutputSizeSelect } from "./OutputSizeSelect";
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
import { LoadingProgress } from "./LoadingProgress";
import { ErrorBoundary } from "./ErrorBoundary";
import { QuickActions } from './QuickActions';
import { RealTimePerformance } from './RealTimePerformance';
import { GenerationAnalytics } from './GenerationAnalytics';
import { PromptEnhancer } from './PromptEnhancer';
import { UserStyleLearning } from './UserStyleLearning';
import { BatchProcessing } from './BatchProcessing';
import { GenerationHistory } from './GenerationHistory';
import { SavedPrompts } from './SavedPrompts';
import { GenerationStats } from './GenerationStats';
import { ExportShare } from './ExportShare';
interface GenerationFormProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedItem: string;
  onItemChange: (item: string) => void;
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
  outputSize: string;
  onOutputSizeChange: (size: string) => void;
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
  outputSize,
  onOutputSizeChange,
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
  useMultipleReferences = false
}: GenerationFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [referenceType, setReferenceType] = useState<ReferenceType>('style');
  const [processingOptions, setProcessingOptions] = useState<ReferenceProcessingOptions>({
    extractColors: true,
    analyzeStyle: true,
    detectObjects: true,
    analyzeComposition: true,
    extractTexture: true
  });
  const {
    analyzing,
    analysis,
    analyzeImage
  } = useReferenceImageAnalysis();
  const hasAnyReference = !!(referenceImage || referenceImages.length > 0);
  const {
    getRecommendedProvider
  } = useSmartProviderFallback(provider, hasAnyReference);
  const handleKeywordClick = (keyword: string) => {
    const currentPrompt = prompt.trim();
    const newPrompt = currentPrompt ? `${currentPrompt}, ${keyword}` : keyword;
    onPromptChange(newPrompt);
  };
  return <ErrorBoundary>
      <div className="space-y-6">
      {/* Loading Progress */}
      {(isGenerating || analyzing || uploadingReference) && <LoadingProgress stage={uploadingReference ? 'uploading' : analyzing ? 'analyzing' : isGenerating ? 'generating' : 'processing'} progress={uploadingReference ? 25 : analyzing ? 50 : isGenerating ? 75 : 100} showStages={hasAnyReference} />}
      
      {/* Prompt Input */}
      <PromptInput prompt={prompt} onPromptChange={onPromptChange} onGenerate={onGenerate} isGenerating={isGenerating} disabled={isGenerating} onReferenceImageUpload={onReferenceImageUpload} referenceImage={referenceImage} />

      {/* Form Collapsible Trigger */}
      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-between">
            <span>Generation Controls</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isFormOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 mt-6">
          {/* Main Generation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SearchableItemSelect value={selectedItem} onChange={onItemChange} disabled={isGenerating} />
            
            <OutputSizeSelect value={outputSize} onChange={onOutputSizeChange} disabled={isGenerating} />
          </div>
          
          <div className="space-y-4">
            <AspectRatioSelect value={selectedRatio} onChange={onRatioChange} disabled={isGenerating} />
          </div>
        </div>

        {/* Enhanced Keyword Suggestions */}
        <EnhancedKeywordSuggestions selectedItem={selectedItem} onKeywordClick={handleKeywordClick} disabled={isGenerating} />
        
        </CollapsibleContent>
      </Collapsible>

      {/* Advanced Options Toggle */}
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="text-white/60 hover:text-white">
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </Button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && <Card className="bg-black/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm">Advanced Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider Recommendation */}
            <ProviderRecommendation selectedItem={selectedItem} selectedRatio={selectedRatio} currentProvider={provider} onProviderChange={onProviderChange || (() => {})} hasReferenceImage={hasAnyReference} />

            {/* Provider Selection */}
            <ProviderSelect value={provider} onChange={onProviderChange || (() => {})} disabled={isGenerating} hasReferenceImage={hasAnyReference} />
            
            {/* Advanced Provider Comparison */}
            <ProviderComparison selectedProvider={provider} onProviderChange={onProviderChange || (() => {})} selectedItem={selectedItem} selectedRatio={selectedRatio} />
            
            {/* Reference Image Processing Analysis */}
            {hasAnyReference && analysis && <Card className="border-border/50 bg-card/50">
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
                  {useMultipleReferences && referenceImages.length > 1 && <div className="text-xs">
                      <span className="font-medium">References:</span> {referenceImages.length} images
                    </div>}
                </CardContent>
              </Card>}
            
            {showItemPreviews && selectedItem && <ItemTypePreviews selectedItem={selectedItem} />}
          </CardContent>
        </Card>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <PromptEnhancer prompt={prompt} itemType={selectedItem} onPromptChange={onPromptChange} />
            
            <SavedPrompts onPromptSelect={onPromptChange} />
            
            <UserStyleLearning />
            
            <BatchProcessing onBatchGenerate={async items => {
            for (const item of items) {
              // This would integrate with the actual generation logic
              console.log('Generating:', item);
            }
          }} />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={() => setIsStatsOpen(!isStatsOpen)} className="text-white/60 hover:text-white">
                {isStatsOpen ? "Hide" : "Show"} Stats & Analytics
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isStatsOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
              <CollapsibleContent className="space-y-4">
                <GenerationStats />
                
                <GenerationHistory />
                
                <GenerationAnalytics providers={['flux.schnell', 'flux.dev']} />
                
                <RealTimePerformance currentProvider={provider} isGenerating={isGenerating} />
                
                <QuickActions onRandomPrompt={() => onPromptChange("A stylish contemporary outfit")} onCopyPrompt={() => navigator.clipboard.writeText(prompt)} hasGeneratedImage={false} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

      {/* Usage Info */}
      <UsageInfo isSignedIn={isSignedIn} remainingImages={remainingImages} />

      {/* Generate Button */}
      <GenerateButton onClick={onGenerate} isGenerating={isGenerating} disabled={!selectedItem || !prompt.trim()} remainingImages={remainingImages} />
      </div>
    </ErrorBoundary>;
};