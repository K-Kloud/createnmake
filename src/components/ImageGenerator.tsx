
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            AI Design Generator
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Create Your Vision
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into stunning designs with our advanced AI technology. 
            Simply describe what you want to create and watch it come to life.
          </p>
        </div>

        {/* Main Generator Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
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

        {/* Status Indicator */}
        {isGenerating && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm font-medium text-primary">Creating your design...</span>
            </div>
          </div>
        )}
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
