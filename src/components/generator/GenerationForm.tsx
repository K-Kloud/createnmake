
import { Card, CardContent } from "@/components/ui/card";
import { ItemSelect } from "./ItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { KeywordSuggestions } from "./KeywordSuggestions";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageInfo } from "./form/UsageInfo";
import { PromptInput } from "./form/PromptInput";
import { ReferenceImageDisplay } from "./form/ReferenceImageDisplay";
import { GenerateButton } from "./form/GenerateButton";

interface GenerationFormProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedItem: string;
  onItemChange: (value: string) => void;
  selectedRatio: string;
  onRatioChange: (value: string) => void;
  referenceImage: File | null;
  onReferenceImageUpload: (file: File | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isSignedIn: boolean;
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
}: GenerationFormProps) => {
  const { 
    subscriptionStatus, 
    canGenerateImage, 
    remainingImages,
    subscribe,
    plans 
  } = useSubscription();

  // Handle keyword click to add to prompt
  const handleKeywordClick = (keyword: string) => {
    onPromptChange(prompt ? `${prompt}, ${keyword}` : keyword);
  };

  // Handle subscription upgrade click
  const handleUpgrade = () => {
    // Get the basic plan (or first available plan)
    const basicPlan = plans && plans.length > 0 
      ? plans.find(plan => plan.name.toLowerCase() === 'basic') || plans[1]
      : undefined;
      
    if (basicPlan) {
      subscribe(basicPlan.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription usage info */}
      {isSignedIn && subscriptionStatus && (
        <UsageInfo 
          imagesGenerated={subscriptionStatus.images_generated}
          monthlyImageLimit={subscriptionStatus.monthly_image_limit}
          tier={subscriptionStatus.tier}
          canGenerateImage={canGenerateImage}
          onUpgrade={handleUpgrade}
        />
      )}

      <div className="space-y-4">
        <ItemSelect 
          value={selectedItem} 
          onChange={onItemChange} 
          disabled={isGenerating}
          isLoading={isGenerating}
        />

        <PromptInput
          prompt={prompt}
          onPromptChange={onPromptChange}
          onReferenceImageUpload={onReferenceImageUpload}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          disabled={!isSignedIn || !canGenerateImage}
        />

        <KeywordSuggestions 
          selectedItem={selectedItem} 
          onKeywordClick={handleKeywordClick}
          disabled={isGenerating} 
        />

        <AspectRatioSelect 
          value={selectedRatio} 
          onChange={onRatioChange}
          disabled={isGenerating}
        />

        {referenceImage && (
          <ReferenceImageDisplay
            file={referenceImage}
            onRemove={() => onReferenceImageUpload(null)}
            disabled={isGenerating}
          />
        )}

        <GenerateButton
          onClick={onGenerate}
          isGenerating={isGenerating}
          disabled={!isSignedIn || !canGenerateImage}
          remainingImages={isSignedIn ? remainingImages : undefined}
        />
      </div>
    </div>
  );
};
