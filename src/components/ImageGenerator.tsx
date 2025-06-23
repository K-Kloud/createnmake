import { useImageGeneration } from "./generator/useImageGeneration";
import { GenerationForm } from "./generator/GenerationForm";
import { PreviewDialog } from "./generator/PreviewDialog";
import { AuthDialog } from "./auth/AuthDialog";

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
    isGenerating,
    authDialogOpen,
    setAuthDialogOpen,
    generatedImageUrl,
    session,
    handleGenerate,
    subscriptionStatus,
    canGenerateImage,
    remainingImages
  } = useImageGeneration();

  // Add function to handle liking images if needed
  const handleLikeImage = (imageId: number) => {
    console.log("Image liked:", imageId);
    // Implement like functionality if needed
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground">AI Design Generator</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create stunning designs with AI. Simply describe what you want to create.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <GenerationForm 
          prompt={prompt} 
          onPromptChange={setPrompt} 
          selectedItem={selectedItem} 
          onItemChange={setSelectedItem} 
          selectedRatio={selectedRatio} 
          onRatioChange={setSelectedRatio} 
          referenceImage={referenceImage} 
          onReferenceImageUpload={setReferenceImage} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          isSignedIn={!!session?.user} 
          remainingImages={remainingImages} 
          showItemPreviews={true} 
        />
      </div>

      <PreviewDialog 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        isGenerating={isGenerating} 
        selectedRatio={selectedRatio} 
        generatedImageUrl={generatedImageUrl} 
        prompt={prompt} 
        onLike={handleLikeImage} 
      />

      <AuthDialog 
        isOpen={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
    </div>
  );
};

export default ImageGenerator;
