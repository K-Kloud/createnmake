import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";

export const useImageGeneration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession();

  // Basic states
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState("furniture");
  const [selectedRatio, setSelectedRatio] = useState("square");
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7.5);
  const [seed, setSeed] = useState(0);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  // UI states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setAuthDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Implement your image generation logic here
      toast({
        title: "Generating image...",
        description: "Please wait while we process your request.",
      });
    } catch (err) {
      console.error("Generation error:", err);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    // Basic states
    loading,
    image,
    error,
    setLoading,
    setImage,
    setError,
    
    // Form states
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    selectedItem,
    setSelectedItem,
    selectedRatio,
    setSelectedRatio,
    steps,
    setSteps,
    guidance,
    setGuidance,
    seed,
    setSeed,
    isAdvancedMode,
    setIsAdvancedMode,
    
    // UI states
    previewOpen,
    setPreviewOpen,
    authDialogOpen,
    setAuthDialogOpen,
    referenceImage,
    setReferenceImage,
    generatedImageUrl,
    isGenerating: loading,
    session,
    handleGenerate,
    
    // Components
    HomeButton: () => (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleHomeClick}
        className="absolute top-4 left-4"
      >
        <Home className="h-5 w-5" />
      </Button>
    ),
  };
};