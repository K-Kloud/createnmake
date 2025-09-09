import { useState, useCallback } from 'react';
import { analyzeReferenceImage, ImageAnalysisResult, ReferenceProcessingOptions } from '@/services/imageAnalysis';
import { useToast } from '@/components/ui/use-toast';

export const useReferenceImageAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeImage = useCallback(async (
    imageUrl: string, 
    options: ReferenceProcessingOptions
  ) => {
    if (!imageUrl) return null;

    setAnalyzing(true);
    try {
      console.log("🔍 Starting image analysis with options:", options);
      
      const result = await analyzeReferenceImage(imageUrl, options);
      setAnalysis(result);
      
      console.log("✅ Image analysis completed:", result);
      
      toast({
        title: "Analysis Complete",
        description: "Reference image has been analyzed successfully.",
      });
      
      return result;
    } catch (error) {
      console.error("❌ Image analysis failed:", error);
      
      toast({
        variant: "destructive",
        title: "Analysis Failed", 
        description: "Unable to analyze reference image. Using fallback analysis.",
      });
      
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [toast]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analyzing,
    analysis,
    analyzeImage,
    clearAnalysis
  };
};