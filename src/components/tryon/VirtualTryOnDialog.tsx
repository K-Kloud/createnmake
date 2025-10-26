import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap } from "lucide-react";
import { VirtualTryOnUpload } from "./VirtualTryOnUpload";
import { TryOnResultDisplay } from "./TryOnResultDisplay";
import { SampleImageSelector } from "./SampleImageSelector";
import { TryOnSettingsControl } from "./TryOnSettingsControl";
import { BatchImageSelector } from "./BatchImageSelector";
import { BatchProgressDisplay } from "./BatchProgressDisplay";
import { BatchResultsGallery } from "./BatchResultsGallery";
import { useVirtualTryOn } from "@/hooks/useVirtualTryOn";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/use-toast";
import { TryOnSettings, TRYON_PRESETS } from "@/types/tryon";

interface VirtualTryOnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatedImageId: number;
  generatedImageUrl: string;
}

export const VirtualTryOnDialog = ({
  open,
  onOpenChange,
  generatedImageId,
  generatedImageUrl,
}: VirtualTryOnDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canGenerateImage, remainingImages } = useSubscription();
  const {
    uploadBodyReference,
    isUploadingBody,
    createSession,
    isCreatingSession,
    generateTryOn,
    isGenerating,
    batchTryOn,
    isBatchProcessing,
  } = useVirtualTryOn();

  const [step, setStep] = useState<"upload" | "result" | "batch-processing" | "batch-results">("upload");
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [sampleBodyUrl, setSampleBodyUrl] = useState<string>("");
  const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [settings, setSettings] = useState<TryOnSettings>(TRYON_PRESETS.balanced);
  
  // Batch mode state
  const [selectedImages, setSelectedImages] = useState<Array<{ id: number; url: string }>>([]);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [batchProgress, setBatchProgress] = useState<Array<{
    url: string;
    status: "pending" | "processing" | "completed" | "failed";
    label: string;
  }>>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tryon-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('tryon-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setStep("upload");
      setMode("single");
      setBodyFile(null);
      setSampleBodyUrl("");
      setBodyImageUrl(null);
      setResultUrl(null);
      setSessionId(null);
      setSelectedImages([]);
      setBatchResults(null);
      setBatchProgress([]);
      setCurrentBatchIndex(0);
    }
  }, [open]);

  const handleFileSelect = (file: File) => {
    setBodyFile(file);
    setSampleBodyUrl(""); // Clear sample selection when file is uploaded
  };

  const handleRemoveFile = () => {
    setBodyFile(null);
    setBodyImageUrl(null);
  };

  const handleSampleSelect = (url: string) => {
    setSampleBodyUrl(url);
    setBodyFile(null); // Clear file selection when sample is selected
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to use the virtual try-on feature.",
      });
      return;
    }

    // Check subscription limits
    if (!canGenerateImage) {
      toast({
        variant: "destructive",
        title: "Monthly Limit Reached",
        description: `You have used all your virtual try-ons this month. You have ${remainingImages} remaining. Upgrade your plan for more.`,
      });
      return;
    }

    const useBodyUrl = sampleBodyUrl || (bodyFile ? await uploadBodyReference(bodyFile) : null);
    
    if (!useBodyUrl) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload a body reference image or select a sample.",
      });
      return;
    }

    try {
      // Step 1: Upload body reference image (if not using sample)
      if (!sampleBodyUrl) {
        toast({
          title: "Uploading reference photo...",
          description: "Step 1 of 3",
        });
      }
      setBodyImageUrl(useBodyUrl);

      // Step 2: Create try-on session
      toast({
        title: "Creating try-on session...",
        description: sampleBodyUrl ? "Step 1 of 2" : "Step 2 of 3",
      });
      const session = await createSession({
        bodyImageUrl: useBodyUrl,
        generatedImageId,
        settings,
      });
      setSessionId(session.id);

      // Step 3: Generate try-on result
      const estimatedTime = getEstimatedTime(settings);
      toast({
        title: "Generating try-on...",
        description: sampleBodyUrl ? `Step 2 of 2 - Estimated time: ${estimatedTime}` : `Step 3 of 3 - Estimated time: ${estimatedTime}`,
      });
      const result = await generateTryOn({
        sessionId: session.id,
        bodyImageUrl: useBodyUrl,
        clothingImageUrl: generatedImageUrl,
        settings,
      });

      if (result.tryon_result_url) {
        setResultUrl(result.tryon_result_url);
        setStep("result");
        toast({
          title: "Success!",
          description: "Your virtual try-on is ready.",
        });
      } else {
        throw new Error("No result URL generated");
      }
    } catch (error) {
      console.error("Try-on generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      let description = "Failed to generate virtual try-on. Please try again.";
      if (errorMessage.includes("limit reached") || errorMessage.includes("Monthly limit")) {
        description = errorMessage;
      } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        description = "Rate limit exceeded. Please try again in a few moments.";
      } else if (errorMessage.includes("credits") || errorMessage.includes("402") || errorMessage.includes("Payment")) {
        description = "Insufficient credits. Please add credits to your workspace.";
      } else if (errorMessage.includes("body") || errorMessage.includes("reference") || errorMessage.includes("process the images")) {
        description = "Could not process images. Try different photos with better lighting and clearer views.";
      }
      
      toast({
        variant: "destructive",
        title: "Try-On Failed",
        description,
      });
    }
  };

  const handleRegenerate = async () => {
    if (!sessionId || !bodyImageUrl) return;

    try {
      const result = await generateTryOn({
        sessionId,
        bodyImageUrl,
        clothingImageUrl: generatedImageUrl,
        settings,
      });

      if (result.tryon_result_url) {
        setResultUrl(result.tryon_result_url);
      }
    } catch (error) {
      console.error("Regeneration failed:", error);
    }
  };

  const getEstimatedTime = (settings: TryOnSettings): string => {
    if (settings.enhanceQuality) return "30-45 seconds";
    return "15-25 seconds";
  };

  const handleBatchGenerate = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to use the virtual try-on feature.",
      });
      return;
    }

    // Check subscription limits
    if (selectedImages.length > remainingImages) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: `You have ${remainingImages} try-ons remaining, but selected ${selectedImages.length} items. Upgrade or reduce selection.`,
      });
      return;
    }

    const useBodyUrl = sampleBodyUrl || (bodyFile ? await uploadBodyReference(bodyFile) : null);
    
    if (!useBodyUrl) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload a body reference image or select a sample.",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        variant: "destructive",
        title: "No Clothing Selected",
        description: "Please select at least one clothing item to try on.",
      });
      return;
    }

    try {
      setBodyImageUrl(useBodyUrl);
      setStep("batch-processing");
      
      // Initialize batch progress
      const progressItems = selectedImages.map((img, idx) => ({
        url: img.url,
        status: "pending" as const,
        label: `Item ${idx + 1}`,
      }));
      setBatchProgress(progressItems);
      setCurrentBatchIndex(0);

      toast({
        title: "Starting batch try-on...",
        description: `Processing ${selectedImages.length} items`,
      });

      const result = await batchTryOn({
        bodyImageUrl: useBodyUrl,
        clothingImageUrls: selectedImages.map(img => img.url),
        generatedImageIds: selectedImages.map(img => img.id),
        settings,
        onProgress: (completed, total, currentUrl) => {
          setCurrentBatchIndex(completed);
          setBatchProgress(prev => 
            prev.map((item, idx) => {
              if (idx < completed) {
                return { ...item, status: "completed" };
              } else if (idx === completed) {
                return { ...item, status: "processing" };
              }
              return item;
            })
          );
        },
      });

      // Update final progress
      setBatchProgress(prev =>
        prev.map((item, idx) => ({
          ...item,
          status: result.failedIndices.includes(idx) ? "failed" : "completed",
          url: result.results[idx]?.tryon_result_url || item.url,
        }))
      );

      setBatchResults(result.results);
      setStep("batch-results");

      const successCount = result.results.length - result.failedIndices.length;
      toast({
        title: "Batch Complete!",
        description: `${successCount} of ${selectedImages.length} try-ons completed successfully.`,
      });
    } catch (error) {
      console.error("Batch try-on failed:", error);
      toast({
        variant: "destructive",
        title: "Batch Try-On Failed",
        description: "Failed to process batch. Please try again.",
      });
      setStep("upload");
    }
  };

  const handleBack = () => {
    setStep("upload");
    setSampleBodyUrl("");
    setSelectedImages([]);
    setBatchResults(null);
  };

  const isProcessing = isUploadingBody || isCreatingSession || isGenerating || isBatchProcessing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "upload" ? "Virtual Try-On" : 
             step === "batch-processing" ? "Processing Batch Try-On" :
             step === "batch-results" ? "Batch Try-On Results" :
             "Try-On Result"}
            {step === "upload" && (
              <span className="text-xs text-muted-foreground font-normal">
                ({remainingImages} remaining this month)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload a full-body photo or use a sample to see how designs look"
              : step === "batch-processing"
              ? "Processing multiple try-ons, please wait..."
              : step === "batch-results"
              ? "View all your batch try-on results"
              : "Compare the original photo with your virtual try-on result"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "upload" ? (
            <>
              <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "batch")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Try-On</TabsTrigger>
                  <TabsTrigger value="batch">
                    <Zap className="h-4 w-4 mr-1" />
                    Batch Mode
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="space-y-4 mt-4">
                  <VirtualTryOnUpload
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemoveFile}
                    selectedFile={bodyFile}
                    disabled={isProcessing}
                  />
                  
                  <div className="pt-4 border-t">
                    <SampleImageSelector 
                      onSelect={handleSampleSelect}
                      selectedUrl={sampleBodyUrl}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <TryOnSettingsControl
                      settings={settings}
                      onChange={setSettings}
                      disabled={isProcessing}
                    />
                    <div className="mt-2 text-xs text-muted-foreground text-center">
                      Estimated generation time: {getEstimatedTime(settings)}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="batch" className="space-y-4 mt-4">
                  <VirtualTryOnUpload
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemoveFile}
                    selectedFile={bodyFile}
                    disabled={isProcessing}
                  />
                  
                  <div className="pt-4 border-t">
                    <SampleImageSelector 
                      onSelect={handleSampleSelect}
                      selectedUrl={sampleBodyUrl}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <BatchImageSelector
                      onSelectionChange={setSelectedImages}
                      maxSelection={10}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <TryOnSettingsControl
                      settings={settings}
                      onChange={setSettings}
                      disabled={isProcessing}
                    />
                    <div className="mt-2 text-xs text-muted-foreground text-center">
                      Estimated time: {selectedImages.length * (settings.enhanceQuality ? 35 : 20)} seconds for {selectedImages.length} items
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                {mode === "single" ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={(!bodyFile && !sampleBodyUrl) || isProcessing || !canGenerateImage}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploadingBody
                          ? "Uploading..."
                          : isCreatingSession
                          ? "Creating Session..."
                          : "Generating..."}
                      </>
                    ) : !canGenerateImage ? (
                      "Limit Reached - Upgrade"
                    ) : (
                      "Generate Try-On"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleBatchGenerate}
                    disabled={
                      (!bodyFile && !sampleBodyUrl) || 
                      selectedImages.length === 0 || 
                      isProcessing || 
                      selectedImages.length > remainingImages
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing Batch...
                      </>
                    ) : selectedImages.length > remainingImages ? (
                      "Insufficient Credits"
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate {selectedImages.length} Try-Ons
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          ) : step === "batch-processing" ? (
            <>
              <BatchProgressDisplay
                items={batchProgress}
                currentIndex={currentBatchIndex}
                estimatedTimePerItem={settings.enhanceQuality ? 35 : 20}
              />
            </>
          ) : step === "batch-results" && batchResults && bodyImageUrl ? (
            <>
              <BatchResultsGallery
                bodyImageUrl={bodyImageUrl}
                results={batchResults}
                onClose={() => onOpenChange(false)}
              />
            </>
          ) : resultUrl && bodyImageUrl ? (
            <>
              <TryOnResultDisplay
                originalImageUrl={bodyImageUrl}
                resultImageUrl={resultUrl}
                onRegenerate={handleRegenerate}
                isRegenerating={isGenerating}
                settings={settings}
              />

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleBack}>
                  Try Another Photo
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
