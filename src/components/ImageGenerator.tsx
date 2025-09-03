
import { useImageGeneration } from "./generator/useImageGeneration";
import { GenerationForm } from "./generator/GenerationForm";
import { PreviewDialog } from "./generator/PreviewDialog";
import { AuthDialog } from "./auth/AuthDialog";
import { Card } from "./ui/card";
import { ResponsiveContainer } from "./ui/responsive-container";

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
    provider,
    setProvider,
    isGenerating,
    authDialogOpen,
    setAuthDialogOpen,
    generatedImageUrl,
    session,
    handleGenerate,
    subscriptionStatus,
    canGenerateImage,
    remainingImages,
    uploadingReference,
  } = useImageGeneration();

  // Add function to handle liking images if needed
  const handleLikeImage = (imageId: number) => {
    console.log("Image liked:", imageId);
    // Implement like functionality if needed
  };

  // Convert File to string URL for display, or handle File directly
  const handleReferenceImageUpload = (file: File | null) => {
    setReferenceImage(file);
  };

  return (
    <ResponsiveContainer padding="md" className="space-y-6 sm:space-y-8 animate-float">
      <Card className="bg-black/50 border border-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl space-y-4 sm:space-y-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,157,0.3)] hover:border-primary/40">
        <GenerationForm
          prompt={prompt}
          onPromptChange={setPrompt}
          selectedItem={selectedItem}
          onItemChange={setSelectedItem}
          selectedRatio={selectedRatio}
          onRatioChange={setSelectedRatio}
          referenceImage={referenceImage}
          onReferenceImageUpload={handleReferenceImageUpload}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          isSignedIn={!!session?.user}
          remainingImages={remainingImages}
          showItemPreviews={true}
          provider={provider}
          uploadingReference={uploadingReference}
          onProviderChange={setProvider}
        />

        <PreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          isGenerating={isGenerating}
          selectedRatio={selectedRatio}
          generatedImageUrl={generatedImageUrl}
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
