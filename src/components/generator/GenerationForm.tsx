
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ItemSelect } from "./ItemSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { Badge } from "@/components/ui/badge";
import { KeywordSuggestions } from "./KeywordSuggestions";
import { Loader } from "lucide-react";

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

      <div className="relative">
        <Textarea
          placeholder="Describe what you want to generate..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[100px] resize-y"
          disabled={isGenerating}
        />
        <div className="absolute bottom-2 right-2">
          <ReferenceImageUpload
            referenceImage={referenceImage}
            onUpload={onReferenceImageUpload}
            disabled={isGenerating}
          />
        </div>
      </div>

      {referenceImage && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Reference Image
          </Badge>
          <span className="truncate">{referenceImage.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onReferenceImageUpload(null)}
            disabled={isGenerating}
          >
            Remove
          </Button>
        </div>
      )}

      <Button 
        onClick={onGenerate} 
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        disabled={!prompt || !selectedItem || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : !isSignedIn ? "Sign in to Generate" : "Generate Design"}
      </Button>

      <AspectRatioSelect
        value={selectedRatio}
        onChange={onRatioChange}
        disabled={isGenerating}
      />

      {selectedItem && (
        <KeywordSuggestions 
          selectedItem={selectedItem} 
          onKeywordClick={(keyword) => {
            const newPrompt = prompt ? `${prompt}, ${keyword}` : keyword;
            onPromptChange(newPrompt);
          }}
          disabled={isGenerating}
        />
      )}
    </div>
  );
};
