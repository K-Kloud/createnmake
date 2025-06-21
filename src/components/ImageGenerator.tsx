import { useImageGeneration } from "./generator/useImageGeneration";
import { GenerationForm } from "./generator/GenerationForm";
import { PreviewDialog } from "./generator/PreviewDialog";
import { AuthDialog } from "./auth/AuthDialog";
import { Card } from "./ui/card";
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
  return <div className="space-y-8 animate-float">
      <Card className="border border-white/10 backdrop-blur-md p-6 rounded-xl space-y-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:border-primary/40 bg-inherit">
        <GenerationForm prompt={prompt} onPromptChange={setPrompt} selectedItem={selectedItem} onItemChange={setSelectedItem} selectedRatio={selectedRatio} onRatioChange={setSelectedRatio} referenceImage={referenceImage} onReferenceImageUpload={setReferenceImage} onGenerate={handleGenerate} isGenerating={isGenerating} isSignedIn={!!session?.user} remainingImages={remainingImages} showItemPreviews={true} />

        <PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} isGenerating={isGenerating} selectedRatio={selectedRatio} generatedImageUrl={generatedImageUrl} prompt={prompt} onLike={handleLikeImage} />
      </Card>

      <AuthDialog isOpen={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </div>;
};
export default ImageGenerator;