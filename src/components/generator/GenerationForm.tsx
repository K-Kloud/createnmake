import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Plus, ImageIcon, X, Paperclip, Mic, Send } from "lucide-react";
import { ItemSelect } from "./ItemSelect";
import { AspectRatioSelect } from "./AspectRatioSelect";
import { ReferenceImageUpload } from "./ReferenceImageUpload";
import { KeywordSuggestions } from "./KeywordSuggestions";
import { useSubscription } from "@/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <div className="relative flex items-center bg-black/30 border border-white/10 rounded-lg overflow-hidden">
            <Input
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder={`Ask anything, create anything...`}
              className="border-0 bg-transparent pr-24 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isGenerating}
            />
            <div className="absolute right-2 flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/20 hover:text-primary"
                          disabled={isGenerating}
                        >
                          <Paperclip className="h-4 w-4" />
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
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Add reference image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/20 hover:text-primary"
                      disabled={isGenerating}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Voice input (coming soon)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onGenerate}
                disabled={isGenerating || !isSignedIn || !canGenerateImage || !prompt.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
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
