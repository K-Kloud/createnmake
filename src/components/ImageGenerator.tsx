import { useImageGeneration } from "./generator/useImageGeneration";
import { GenerationForm } from "./generator/GenerationForm";
import { PreviewDialog } from "./generator/PreviewDialog";
import { AuthDialog } from "./auth/AuthDialog";

export const ImageGenerator = () => {
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
    handleGenerate
  } = useImageGeneration();

  return (
    <div className="space-y-8 animate-float">
      <div className="glass-card p-6 rounded-xl space-y-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(110,89,165,0.5)] hover:border-primary/50">
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
        />

        <PreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          isGenerating={isGenerating}
          selectedRatio={selectedRatio}
          generatedImageUrl={generatedImageUrl}
        />
      </div>

      <AuthDialog 
        isOpen={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
    </div>
  );
};