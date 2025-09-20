import { supabase } from "@/integrations/supabase/client";

export interface DesignQualityMetrics {
  feasibilityScore: number; // 0-10
  complexityScore: number; // 0-10  
  manufacturabilityScore: number; // 0-10
  costEfficiencyScore: number; // 0-10
  overallScore: number; // 0-10
  recommendations: string[];
  warnings: string[];
}

export interface DesignValidationResult {
  isValid: boolean;
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  technicalFeasibility: {
    canManufacture: boolean;
    estimatedDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
    requiredTools: string[];
    requiredSkills: string[];
  };
  materialCompatibility: {
    recommendedMaterials: string[];
    incompatibleMaterials: string[];
    estimatedCost: {
      min: number;
      max: number;
      currency: string;
    };
  };
}

export interface DesignOptimization {
  optimizedPrompt: string;
  suggestedModifications: Array<{
    aspect: string;
    original: string;
    suggested: string;
    reasoning: string;
    impact: 'cost' | 'time' | 'quality' | 'manufacturability';
  }>;
  alternativeDesigns: Array<{
    variant: string;
    description: string;
    benefits: string[];
    tradeoffs: string[];
  }>;
}

export class DesignIntelligenceService {
  private static instance: DesignIntelligenceService;

  static getInstance(): DesignIntelligenceService {
    if (!DesignIntelligenceService.instance) {
      DesignIntelligenceService.instance = new DesignIntelligenceService();
    }
    return DesignIntelligenceService.instance;
  }

  async analyzeDesignQuality(
    imageUrl: string, 
    prompt: string, 
    productType: string
  ): Promise<DesignQualityMetrics> {
    try {
      // Call edge function for AI-powered design analysis
      const { data, error } = await supabase.functions.invoke('validate-design', {
        body: {
          imageUrl,
          prompt,
          productType,
          analysisType: 'quality'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Design quality analysis failed:', error);
      // Fallback to basic heuristic analysis
      return this.fallbackQualityAnalysis(prompt, productType);
    }
  }

  async validateDesign(
    imageUrl: string,
    prompt: string,
    productType: string,
    requirements?: any
  ): Promise<DesignValidationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-design', {
        body: {
          imageUrl,
          prompt,
          productType,
          requirements: requirements || {},
          analysisType: 'validation'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Design validation failed:', error);
      return this.fallbackDesignValidation(prompt, productType);
    }
  }

  async optimizeDesign(
    imageUrl: string,
    prompt: string,
    productType: string,
    validationResult: DesignValidationResult
  ): Promise<DesignOptimization> {
    try {
      const { data, error } = await supabase.functions.invoke('optimize-design', {
        body: {
          imageUrl,
          prompt,
          productType,
          validationIssues: validationResult.issues,
          feasibilityData: validationResult.technicalFeasibility
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Design optimization failed:', error);
      return this.fallbackDesignOptimization(prompt, validationResult);
    }
  }

  async estimateProductionCost(
    designData: any,
    productType: string,
    quantity: number = 1,
    materials?: string[]
  ): Promise<{
    baseCost: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    totalCost: number;
    priceRange: { min: number; max: number };
    currency: string;
    breakdown: Array<{ item: string; cost: number; percentage: number }>;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('estimate-production-cost', {
        body: {
          designData,
          productType,
          quantity,
          materials: materials || [],
          complexity: await this.estimateComplexity(designData, productType)
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Cost estimation failed:', error);
      return this.fallbackCostEstimation(productType, quantity);
    }
  }

  async generateDesignVariations(
    basePrompt: string,
    productType: string,
    variationCount: number = 3
  ): Promise<Array<{
    prompt: string;
    title: string;
    description: string;
    tags: string[];
    estimatedComplexity: number;
  }>> {
    // Generate variations based on style, materials, size, etc.
    const variations = [];
    const styles = ['minimalist', 'modern', 'rustic', 'industrial', 'vintage'];
    const materials = ['wood', 'metal', 'glass', 'ceramic', 'fabric'];
    const sizes = ['compact', 'standard', 'large'];

    for (let i = 0; i < Math.min(variationCount, 5); i++) {
      const style = styles[i % styles.length];
      const material = materials[i % materials.length];
      const size = sizes[i % sizes.length];

      variations.push({
        prompt: `${basePrompt} in ${style} style using ${material}, ${size} size`,
        title: `${style.charAt(0).toUpperCase() + style.slice(1)} ${productType}`,
        description: `A ${style} interpretation using ${material} materials in ${size} format`,
        tags: [style, material, size, productType],
        estimatedComplexity: Math.random() * 10
      });
    }

    return variations;
  }

  private async estimateComplexity(designData: any, productType: string): Promise<number> {
    // Simple heuristic for complexity estimation
    let complexity = 5; // Base complexity

    if (designData.prompt) {
      const words = designData.prompt.toLowerCase().split(' ');
      
      // Increase complexity for certain keywords
      const complexKeywords = ['intricate', 'detailed', 'ornate', 'complex', 'multi-part'];
      const simpleKeywords = ['simple', 'minimal', 'basic', 'clean', 'plain'];
      
      complexKeywords.forEach(keyword => {
        if (words.includes(keyword)) complexity += 1;
      });
      
      simpleKeywords.forEach(keyword => {
        if (words.includes(keyword)) complexity -= 1;
      });
    }

    // Product type complexity modifiers
    const productComplexity: Record<string, number> = {
      'jewelry': 8,
      'furniture': 6,
      'clothing': 7,
      'art': 9,
      'tool': 5,
      'accessory': 4
    };

    if (productComplexity[productType]) {
      complexity = (complexity + productComplexity[productType]) / 2;
    }

    return Math.max(1, Math.min(10, complexity));
  }

  // Fallback methods for when AI analysis fails
  private fallbackQualityAnalysis(prompt: string, productType: string): DesignQualityMetrics {
    const wordCount = prompt.split(' ').length;
    const complexity = wordCount > 20 ? 8 : wordCount > 10 ? 6 : 4;
    
    return {
      feasibilityScore: 7,
      complexityScore: complexity,
      manufacturabilityScore: 6,
      costEfficiencyScore: 7,
      overallScore: (7 + complexity + 6 + 7) / 4,
      recommendations: [
        'Consider specifying materials for better cost estimation',
        'Add dimensional constraints for improved manufacturability'
      ],
      warnings: []
    };
  }

  private fallbackDesignValidation(prompt: string, productType: string): DesignValidationResult {
    return {
      isValid: true,
      score: 7.5,
      issues: [
        {
          type: 'suggestion',
          message: 'Consider adding specific dimensions for better manufacturing accuracy',
          severity: 'low'
        }
      ],
      technicalFeasibility: {
        canManufacture: true,
        estimatedDifficulty: 'medium',
        requiredTools: ['basic tools'],
        requiredSkills: ['intermediate craftsmanship']
      },
      materialCompatibility: {
        recommendedMaterials: ['wood', 'metal', 'plastic'],
        incompatibleMaterials: [],
        estimatedCost: {
          min: 50,
          max: 200,
          currency: 'USD'
        }
      }
    };
  }

  private fallbackDesignOptimization(prompt: string, validationResult: DesignValidationResult): DesignOptimization {
    return {
      optimizedPrompt: `${prompt} with improved manufacturability and cost efficiency`,
      suggestedModifications: [
        {
          aspect: 'materials',
          original: 'unspecified materials',
          suggested: 'specify eco-friendly materials',
          reasoning: 'Better for environment and cost prediction',
          impact: 'cost'
        }
      ],
      alternativeDesigns: [
        {
          variant: 'simplified version',
          description: 'Reduced complexity while maintaining core functionality',
          benefits: ['Lower cost', 'Faster production'],
          tradeoffs: ['Less detailed finish', 'Simplified design']
        }
      ]
    };
  }

  private fallbackCostEstimation(productType: string, quantity: number) {
    const baseCosts: Record<string, number> = {
      jewelry: 150,
      furniture: 300,
      clothing: 80,
      art: 200,
      tool: 100,
      accessory: 50
    };

    const baseCost = baseCosts[productType] || 100;
    const materialCost = baseCost * 0.4;
    const laborCost = baseCost * 0.5;
    const overheadCost = baseCost * 0.1;
    const totalCost = baseCost * quantity;

    return {
      baseCost,
      materialCost,
      laborCost,
      overheadCost,
      totalCost,
      priceRange: {
        min: totalCost * 0.8,
        max: totalCost * 1.5
      },
      currency: 'USD',
      breakdown: [
        { item: 'Materials', cost: materialCost, percentage: 40 },
        { item: 'Labor', cost: laborCost, percentage: 50 },
        { item: 'Overhead', cost: overheadCost, percentage: 10 }
      ]
    };
  }
}

export const designIntelligence = DesignIntelligenceService.getInstance();