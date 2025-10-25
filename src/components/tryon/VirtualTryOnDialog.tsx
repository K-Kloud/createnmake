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
import { useVirtualTryOn } from "@/hooks/useVirtualTryOn";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/use-toast";

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
  } = useVirtualTryOn();

  const [step, setStep] = useState<"upload" | "result">("upload");
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [sampleBodyUrl, setSampleBodyUrl] = useState<string>("");
  const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

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
        settings: {
          fitAdjustment: "regular",
          preserveBackground: true,
          enhanceQuality: true,
        },
      });
      setSessionId(session.id);

      // Step 3: Generate try-on result
      toast({
        title: "Generating try-on...",
        description: sampleBodyUrl ? "Step 2 of 2 - This may take 15-30 seconds" : "Step 3 of 3 - This may take 15-30 seconds",
      });
      const result = await generateTryOn({
        sessionId: session.id,
        bodyImageUrl: useBodyUrl,
        clothingImageUrl: generatedImageUrl,
        settings: {
          fitAdjustment: "regular",
          preserveBackground: true,
          enhanceQuality: true,
        },
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
        settings: {
          fitAdjustment: "regular",
          preserveBackground: true,
          enhanceQuality: true,
        },
      });

      if (result.tryon_result_url) {
        setResultUrl(result.tryon_result_url);
      }
    } catch (error) {
      console.error("Regeneration failed:", error);
    }
  };

  const handleBack = () => {
    setStep("upload");
    setSampleBodyUrl("");
  };

  const isProcessing = isUploadingBody || isCreatingSession || isGenerating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "upload" ? "Virtual Try-On" : "Try-On Result"}
            {step === "upload" && (
              <span className="text-xs text-muted-foreground font-normal">
                ({remainingImages} remaining this month)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload a full-body photo or use a sample to see how this design looks"
              : "Compare the original photo with your virtual try-on result"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "upload" ? (
            <>
              <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "batch")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Try-On</TabsTrigger>
                  <TabsTrigger value="batch" disabled>
                    <Zap className="h-4 w-4 mr-1" />
                    Batch Mode (Coming Soon)
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
                </TabsContent>
                
                <TabsContent value="batch">
                  <div className="text-center py-8 text-muted-foreground">
                    Batch try-on feature coming soon! Try multiple outfits at once.
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
              </div>
            </>
          ) : resultUrl && bodyImageUrl ? (
            <>
              <TryOnResultDisplay
                originalImageUrl={bodyImageUrl}
                resultImageUrl={resultUrl}
                onRegenerate={handleRegenerate}
                isRegenerating={isGenerating}
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
