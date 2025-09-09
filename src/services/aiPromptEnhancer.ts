import { supabase } from "@/integrations/supabase/client";

export interface PromptEnhancementResult {
  enhancedPrompt: string;
  suggestions: string[];
  confidence: number;
  improvements: string[];
}

export interface UserStyleProfile {
  preferredStyles: string[];
  commonKeywords: string[];
  colorPalette: string[];
  aspectRatioPreference: string;
  qualityLevel: 'high' | 'medium' | 'fast';
}

export const enhancePromptWithAI = async (
  originalPrompt: string,
  itemType: string,
  userProfile?: UserStyleProfile
): Promise<PromptEnhancementResult> => {
  try {
    console.log("🤖 Enhancing prompt with AI:", originalPrompt);
    
    const { data, error } = await supabase.functions.invoke('enhance-prompt-ai', {
      body: {
        prompt: originalPrompt,
        itemType,
        userProfile
      }
    });

    if (error) {
      throw new Error(`Prompt enhancement failed: ${error.message}`);
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Prompt enhancement failed');
    }

    console.log("✅ Prompt enhanced successfully");
    return data.result;
  } catch (error) {
    console.error("❌ Prompt enhancement error:", error);
    
    // Fallback enhancement
    return createFallbackEnhancement(originalPrompt, itemType, userProfile);
  }
};

const createFallbackEnhancement = (
  prompt: string,
  itemType: string,
  userProfile?: UserStyleProfile
): PromptEnhancementResult => {
  console.log("🔄 Using fallback prompt enhancement");
  
  const qualityTerms = userProfile?.qualityLevel === 'high' 
    ? "ultra high resolution, professional quality, detailed textures"
    : userProfile?.qualityLevel === 'medium'
    ? "high quality, good details"
    : "clean, simple";
    
  const styleTerms = userProfile?.preferredStyles?.slice(0, 2).join(", ") || "contemporary";
  
  const enhancedPrompt = `${prompt}, ${styleTerms} style, ${qualityTerms}, studio lighting, professional photography`;
  
  return {
    enhancedPrompt,
    suggestions: [
      "Add more specific color descriptions",
      "Include lighting preferences",
      "Specify fabric texture details"
    ],
    confidence: 0.7,
    improvements: [
      "Enhanced with user style preferences",
      "Added quality descriptors",
      "Improved technical specifications"
    ]
  };
};

export const analyzeUserGenerationHistory = async (userId: string): Promise<UserStyleProfile> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-user-style', {
      body: { userId }
    });

    if (error || !data?.success) {
      return createDefaultProfile();
    }

    return data.profile;
  } catch (error) {
    console.error("❌ User style analysis error:", error);
    return createDefaultProfile();
  }
};

const createDefaultProfile = (): UserStyleProfile => ({
  preferredStyles: ["contemporary", "minimalist"],
  commonKeywords: ["professional", "clean", "elegant"],
  colorPalette: ["neutral", "monochrome"],
  aspectRatioPreference: "1:1",
  qualityLevel: "high"
});

export const suggestPromptImprovements = (prompt: string, itemType: string): string[] => {
  const suggestions: string[] = [];
  
  if (!prompt.includes("color") && !prompt.includes("white") && !prompt.includes("black")) {
    suggestions.push("Consider specifying colors or color palette");
  }
  
  if (!prompt.includes("texture") && !prompt.includes("fabric") && !prompt.includes("material")) {
    suggestions.push("Add material or texture descriptions");
  }
  
  if (!prompt.includes("style") && !prompt.includes("modern") && !prompt.includes("vintage")) {
    suggestions.push("Include style descriptors (modern, vintage, etc.)");
  }
  
  if (!prompt.includes("lighting") && !prompt.includes("studio")) {
    suggestions.push("Specify lighting conditions for better results");
  }
  
  if (prompt.length < 20) {
    suggestions.push("Consider adding more descriptive details");
  }
  
  return suggestions.slice(0, 3); // Limit to top 3 suggestions
};