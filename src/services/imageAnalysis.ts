import { supabase } from "@/integrations/supabase/client";

export interface ImageAnalysisResult {
  dominantColors: string[];
  style: string;
  composition: string;
  objects: string[];
  textureDescription: string;
  enhancedPrompt: string;
}

export interface ReferenceProcessingOptions {
  extractColors: boolean;
  analyzeStyle: boolean;
  detectObjects: boolean;
  analyzeComposition: boolean;
  extractTexture: boolean;
}

export const analyzeReferenceImage = async (
  imageUrl: string, 
  options: ReferenceProcessingOptions = {
    extractColors: true,
    analyzeStyle: true,
    detectObjects: true,
    analyzeComposition: true,
    extractTexture: true
  }
): Promise<ImageAnalysisResult> => {
  try {
    console.log("🔍 Analyzing reference image:", imageUrl);
    
    const { data, error } = await supabase.functions.invoke('analyze-reference-image', {
      body: { 
        imageUrl,
        options
      }
    });

    if (error) {
      throw new Error(`Image analysis failed: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Image analysis failed');
    }

    console.log("✅ Image analysis completed:", data.analysis);
    return data.analysis;
  } catch (error) {
    console.error("❌ Image analysis error:", error);
    
    // Fallback to basic analysis
    return createFallbackAnalysis(imageUrl);
  }
};

const createFallbackAnalysis = (imageUrl: string): ImageAnalysisResult => {
  console.log("🔄 Using fallback image analysis");
  
  return {
    dominantColors: ["#333333", "#666666", "#999999"],
    style: "contemporary",
    composition: "centered subject with balanced proportions",
    objects: ["clothing item", "fashion piece"],
    textureDescription: "smooth fabric with natural draping",
    enhancedPrompt: "inspired by the reference image's style and composition"
  };
};

export const generateEnhancedPromptFromAnalysis = (
  originalPrompt: string,
  analysis: ImageAnalysisResult,
  itemType: string
): string => {
  const colorDescriptions = analysis.dominantColors.length > 0 
    ? `with colors inspired by ${analysis.dominantColors.slice(0, 3).join(", ")}`
    : "";
    
  const styleDescription = analysis.style 
    ? `in ${analysis.style} style`
    : "";
    
  const textureDescription = analysis.textureDescription 
    ? `featuring ${analysis.textureDescription}`
    : "";
    
  const compositionDescription = analysis.composition 
    ? `with ${analysis.composition}`
    : "";

  const enhancedParts = [
    originalPrompt,
    colorDescriptions,
    styleDescription,
    textureDescription,
    compositionDescription
  ].filter(Boolean);

  return enhancedParts.join(", ");
};