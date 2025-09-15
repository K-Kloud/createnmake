
import { useState } from "react";
import { useImageGeneration } from "./generator/useImageGeneration";
import { GenerationForm } from "./generator/GenerationForm";
import { PreviewDialog } from "./generator/PreviewDialog";
import { AuthDialog } from "./auth/AuthDialog";
import { Card } from "./ui/card";
import { ResponsiveContainer } from "./ui/responsive-container";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export const ImageGenerator = () => {
  // Keep using the same hook which internally uses the refactored hooks
  const {
    prompt,
    setPrompt,
    selectedItem,
    setSelectedItem,
    selectedRatio,
    setSelectedRatio,
    previewOpen,
    setPreviewOpen,
    referenceImage,
    setReferenceImage,
    referenceImages,
    setReferenceImages,
    referenceType,
    setReferenceType,
    provider,
    setProvider,
    isGenerating,
    authDialogOpen,
    setAuthDialogOpen,
    generatedImageUrl,
    generatedImageId,
    session,
    handleGenerate,
    subscriptionStatus,
    canGenerateImage,
    remainingImages,
    uploadingReference,
  } = useImageGeneration();

  // State for UI mode switching
  const [useMultipleReferences, setUseMultipleReferences] = useState(false);

  // Add function to handle liking images if needed
  const handleLikeImage = (imageId: number) => {
    console.log("Image liked:", imageId);
    // Implement like functionality if needed
  };

  // Convert File to string URL for display, or handle File directly
  const handleReferenceImageUpload = (file: File | null) => {
    setReferenceImage(file);
  };

  const handleReferenceImagesChange = (files: File[]) => {
    setReferenceImages(files);
  };

  return (
    <ResponsiveContainer padding="md" className="space-y-6 sm:space-y-8">
      <Card className="bg-card border border-border shadow-sm p-4 sm:p-6 rounded-lg space-y-4 sm:space-y-6 transition-all duration-200 hover:shadow-md">
        
        {/* Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
          <div className="flex items-center space-x-2">
            <Label htmlFor="multiple-references" className="text-sm font-medium">
              Multiple Reference Images
            </Label>
            <Switch
              id="multiple-references"
              checked={useMultipleReferences}
              onCheckedChange={setUseMultipleReferences}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {useMultipleReferences ? 'Advanced multi-modal mode' : 'Single reference mode'}
          </div>
        </div>

        <GenerationForm
          prompt={prompt}
          onPromptChange={setPrompt}
          selectedItem={selectedItem}
          onItemChange={setSelectedItem}
          selectedRatio={selectedRatio}
          onRatioChange={setSelectedRatio}
          referenceImage={referenceImage}
          onReferenceImageUpload={handleReferenceImageUpload}
          referenceImages={referenceImages}
          onReferenceImagesChange={handleReferenceImagesChange}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          isSignedIn={!!session?.user}
          remainingImages={remainingImages}
          showItemPreviews={true}
          provider={provider}
          uploadingReference={uploadingReference}
          onProviderChange={setProvider}
          useMultipleReferences={useMultipleReferences}
        />

        <PreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          isGenerating={isGenerating}
          selectedRatio={selectedRatio}
          generatedImageUrl={generatedImageUrl}
          generatedImageId={generatedImageId}
          prompt={prompt}
          onLike={handleLikeImage}
        />
      </Card>

      <AuthDialog 
        isOpen={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
    </ResponsiveContainer>
  );
};

export default ImageGenerator;
