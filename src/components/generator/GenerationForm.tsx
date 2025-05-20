
import { useState } from "react";
import { PromptInput } from "./form/PromptInput";
import { ItemSelect } from "./ItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ReferenceImageDisplay } from "./form/ReferenceImageDisplay";
import { KeywordSuggestions } from "./KeywordSuggestions";
import { GenerateButton } from "./form/GenerateButton";
import { UsageInfo } from "./form/UsageInfo";
import { ItemTypePreviews } from "./form/ItemTypePreviews";

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
  isSignedIn?: boolean;
  remainingImages?: number;
  showItemPreviews?: boolean;
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
  isSignedIn = false,
  remainingImages,
  showItemPreviews = false
}: GenerationFormProps) => {
  const [showKeywords, setShowKeywords] = useState(true);

  const handleItemChange = (value: string) => {
    onItemChange(value);
    if (!prompt || prompt.length < 10) {
      // If the prompt is empty or very short, show keywords
      setShowKeywords(true);
    }
  };
  
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onGenerate(); }}>
      <PromptInput
        prompt={prompt}
        onPromptChange={onPromptChange}
        onReferenceImageUpload={onReferenceImageUpload}
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        disabled={!isSignedIn}
      />

      {referenceImage && (
        <ReferenceImageDisplay
          file={referenceImage}
          onRemove={() => onReferenceImageUpload(null)}
        />
      )}

      {showKeywords && (
        <KeywordSuggestions
          selectedItem={selectedItem}
          onKeywordClick={(suggestion) => {
            const newPrompt = prompt ? `${prompt} ${suggestion}` : suggestion;
            onPromptChange(newPrompt);
          }}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ItemSelect
          value={selectedItem}
          onChange={handleItemChange}
        />

        <AspectRatioSelect
          value={selectedRatio}
          onChange={onRatioChange}
        />
      </div>

      {showItemPreviews && (
        <ItemTypePreviews selectedItem={selectedItem} />
      )}

      <GenerateButton
        onClick={onGenerate}
        isGenerating={isGenerating}
        disabled={!prompt.trim() || !isSignedIn}
        remainingImages={remainingImages}
      />

      <UsageInfo isSignedIn={isSignedIn} />
    </form>
  );
};
