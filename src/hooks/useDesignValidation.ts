import { useState, useCallback } from 'react';
import { designIntelligence, DesignValidationResult, DesignQualityMetrics, DesignOptimization } from '@/services/designIntelligence';
import { useToast } from '@/hooks/use-toast';

export const useDesignValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validationResult, setValidationResult] = useState<DesignValidationResult | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<DesignQualityMetrics | null>(null);
  const [optimization, setOptimization] = useState<DesignOptimization | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const validateDesign = useCallback(async (
    imageUrl: string,
    prompt: string,
    productType: string,
    requirements?: any
  ) => {
    setIsValidating(true);
    setError(null);

    try {
      const result = await designIntelligence.validateDesign(
        imageUrl,
        prompt,
        productType,
        requirements
      );

      setValidationResult(result);

      if (!result.isValid) {
        toast({
          variant: "destructive",
          title: "Design Validation Issues",
          description: `Found ${result.issues.length} issues that need attention.`,
        });
      } else {
        toast({
          title: "Design Validated",
          description: `Design score: ${result.score.toFixed(1)}/10`,
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Design validation failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const analyzeQuality = useCallback(async (
    imageUrl: string,
    prompt: string,
    productType: string
  ) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const metrics = await designIntelligence.analyzeDesignQuality(
        imageUrl,
        prompt,
        productType
      );

      setQualityMetrics(metrics);

      toast({
        title: "Quality Analysis Complete",
        description: `Overall score: ${metrics.overallScore.toFixed(1)}/10`,
      });

      return metrics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Quality analysis failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const optimizeDesign = useCallback(async (
    imageUrl: string,
    prompt: string,
    productType: string,
    validationData?: DesignValidationResult
  ) => {
    setIsOptimizing(true);
    setError(null);

    try {
      const validationToUse = validationData || validationResult;
      if (!validationToUse) {
        throw new Error('Design must be validated before optimization');
      }

      const optimizationResult = await designIntelligence.optimizeDesign(
        imageUrl,
        prompt,
        productType,
        validationToUse
      );

      setOptimization(optimizationResult);

      toast({
        title: "Design Optimized",
        description: `Generated ${optimizationResult.suggestedModifications.length} improvements and ${optimizationResult.alternativeDesigns.length} alternatives.`,
      });

      return optimizationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Design optimization failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Optimization Error",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }, [validationResult, toast]);

  const generateVariations = useCallback(async (
    basePrompt: string,
    productType: string,
    count: number = 3
  ) => {
    try {
      const variations = await designIntelligence.generateDesignVariations(
        basePrompt,
        productType,
        count
      );

      toast({
        title: "Variations Generated",
        description: `Created ${variations.length} design variations.`,
      });

      return variations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate variations';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: errorMessage,
      });
      throw err;
    }
  }, [toast]);

  const estimateCost = useCallback(async (
    designData: any,
    productType: string,
    quantity: number = 1,
    materials?: string[]
  ) => {
    try {
      const costEstimate = await designIntelligence.estimateProductionCost(
        designData,
        productType,
        quantity,
        materials
      );

      toast({
        title: "Cost Estimated",
        description: `Total cost: $${costEstimate.totalCost.toFixed(2)} for ${quantity} unit(s)`,
      });

      return costEstimate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cost estimation failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Estimation Error",
        description: errorMessage,
      });
      throw err;
    }
  }, [toast]);

  const clearResults = useCallback(() => {
    setValidationResult(null);
    setQualityMetrics(null);
    setOptimization(null);
    setError(null);
  }, []);

  const getValidationSummary = useCallback(() => {
    if (!validationResult) return null;

    const errorCount = validationResult.issues.filter(i => i.type === 'error').length;
    const warningCount = validationResult.issues.filter(i => i.type === 'warning').length;
    const suggestionCount = validationResult.issues.filter(i => i.type === 'suggestion').length;

    return {
      isValid: validationResult.isValid,
      score: validationResult.score,
      errorCount,
      warningCount,
      suggestionCount,
      canManufacture: validationResult.technicalFeasibility.canManufacture,
      difficulty: validationResult.technicalFeasibility.estimatedDifficulty,
      costRange: validationResult.materialCompatibility.estimatedCost
    };
  }, [validationResult]);

  return {
    // State
    isValidating,
    isOptimizing,
    isAnalyzing,
    validationResult,
    qualityMetrics,
    optimization,
    error,

    // Actions
    validateDesign,
    analyzeQuality,
    optimizeDesign,
    generateVariations,
    estimateCost,
    clearResults,

    // Computed
    getValidationSummary
  };
};