import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { VirtualTryOnUpload } from "./VirtualTryOnUpload";
import { TryOnResultDisplay } from "./TryOnResultDisplay";
import { useVirtualTryOn } from "@/hooks/useVirtualTryOn";
import { useAuth } from "@/hooks/useAuth";
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
  const {
    uploadBodyReference,
    isUploadingBody,
    createSession,
    isCreatingSession,
    generateTryOn,
    isGenerating,
  } = useVirtualTryOn();

  const [step, setStep] = useState<"upload" | "result">("upload");
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setStep("upload");
      setBodyFile(null);
      setBodyImageUrl(null);
      setResultUrl(null);
      setSessionId(null);
    }
  }, [open]);

  const handleFileSelect = (file: File) => {
    setBodyFile(file);
  };

  const handleRemoveFile = () => {
    setBodyFile(null);
    setBodyImageUrl(null);
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

    if (!bodyFile) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload a body reference image first.",
      });
      return;
    }

    try {
      // Upload body reference image
      const uploadedUrl = await uploadBodyReference(bodyFile);
      setBodyImageUrl(uploadedUrl);

      // Create try-on session
      const session = await createSession({
        bodyImageUrl: uploadedUrl,
        generatedImageId,
      });
      setSessionId(session.id);

      // Generate try-on result
      const result = await generateTryOn({
        sessionId: session.id,
        bodyImageUrl: uploadedUrl,
        clothingImageUrl: generatedImageUrl,
      });

      if (result.tryon_result_url) {
        setResultUrl(result.tryon_result_url);
        setStep("result");
      } else {
        throw new Error("No result URL generated");
      }
    } catch (error) {
      console.error("Try-on generation failed:", error);
      // Error is already handled by the hook's onError
    }
  };

  const handleRegenerate = async () => {
    if (!sessionId || !bodyImageUrl) return;

    try {
      const result = await generateTryOn({
        sessionId,
        bodyImageUrl,
        clothingImageUrl: generatedImageUrl,
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
  };

  const isProcessing = isUploadingBody || isCreatingSession || isGenerating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" ? "Virtual Try-On" : "Try-On Result"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload a full-body photo to see how this design looks on you"
              : "Compare the original photo with your virtual try-on result"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "upload" ? (
            <>
              <VirtualTryOnUpload
                onFileSelect={handleFileSelect}
                onRemove={handleRemoveFile}
                selectedFile={bodyFile}
                disabled={isProcessing}
              />

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
                  disabled={!bodyFile || isProcessing}
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
