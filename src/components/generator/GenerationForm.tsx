
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { ItemSelect } from "./ItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { KeywordSuggestions } from "./KeywordSuggestions";
import { useSubscription } from "@/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";

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
          <Input
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={`Describe the ${selectedItem} you want to create...`}
            className="bg-card/30"
            disabled={isGenerating}
          />
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

        <ReferenceImageUpload
          onUpload={onReferenceImageUpload}
          file={referenceImage}
          disabled={isGenerating}
        />

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
