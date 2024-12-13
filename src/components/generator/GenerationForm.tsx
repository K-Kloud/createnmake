import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ItemSelect } from "./ItemSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";

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
  return (
    <div className="space-y-6">
      <ItemSelect 
        value={selectedItem} 
        onChange={onItemChange} 
      />

      <ReferenceImageUpload
        referenceImage={referenceImage}
        onUpload={onReferenceImageUpload}
      />

      <Textarea
        placeholder="Describe what you want to generate..."
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="min-h-[100px]"
      />

      <Button 
        onClick={onGenerate} 
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        disabled={!prompt || !selectedItem || isGenerating}
      >
        {!isSignedIn ? "Sign in to Generate" : "Generate"}
      </Button>

      <AspectRatioSelect
        value={selectedRatio}
        onChange={onRatioChange}
      />
    </div>
  );
};