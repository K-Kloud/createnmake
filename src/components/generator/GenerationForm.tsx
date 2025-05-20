
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Plus, ImageIcon } from "lucide-react";
import { ItemSelect } from "./ItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { KeywordSuggestions } from "./KeywordSuggestions";
import { useSubscription } from "@/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  // Handle file change for reference image
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      onReferenceImageUpload(selectedFile);
    }
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
        <Card className="bg-muted/50">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                Images this month: {subscriptionStatus.images_generated} of {subscriptionStatus.monthly_image_limit}
              </div>
              <div className="text-sm">
                {subscriptionStatus.tier !== "free" ? (
                  <span className="text-primary font-medium">{subscriptionStatus.tier.charAt(0).toUpperCase() + subscriptionStatus.tier.slice(1)} Plan</span>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-primary hover:text-primary flex items-center gap-1"
                    onClick={handleUpgrade}
                  >
                    <Zap className="w-3 h-3" /> Upgrade
                  </Button>
                )}
              </div>
            </div>

            <Progress
              value={(subscriptionStatus.images_generated / subscriptionStatus.monthly_image_limit) * 100}
              className="h-1.5"
            />

            {!canGenerateImage && (
              <div className="mt-2 text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs" 
                  onClick={handleUpgrade}
                >
                  Upgrade to generate more images
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <ItemSelect 
          value={selectedItem} 
          onChange={onItemChange} 
          disabled={isGenerating}
          isLoading={isGenerating}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <div className="relative">
            <Input
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder={`Describe the ${selectedItem} you want to create...`}
              className="bg-card/30 pr-14"
              disabled={isGenerating}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground button-glow"
                  size="icon"
                  disabled={isGenerating}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <label 
                  htmlFor="prompt-file-upload" 
                  className={`
                    flex flex-col items-center justify-center cursor-pointer
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Add reference image</span>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                  <input
                    id="prompt-file-upload"
                    name="prompt-file-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isGenerating}
                  />
                </label>
              </PopoverContent>
            </Popover>
          </div>
        </div>

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
          <div className="space-y-2">
            <label className="text-sm font-medium">Reference Image</label>
            <div className="relative">
              <img 
                src={URL.createObjectURL(referenceImage)} 
                alt="Reference" 
                className="w-full rounded-md object-cover max-h-48"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => onReferenceImageUpload(null)}
                disabled={isGenerating}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            onClick={onGenerate}
            className="w-full"
            disabled={isGenerating || !isSignedIn || !canGenerateImage}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Design"
            )}
          </Button>

          {isSignedIn && remainingImages > 0 && (
            <p className="text-xs text-center mt-2 text-muted-foreground">
              You have {remainingImages} image{remainingImages !== 1 ? 's' : ''} remaining this month
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
