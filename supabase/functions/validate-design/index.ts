import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt, productType, requirements, analysisType } = await req.json();

    console.log('🎨 Design validation request:', {
      productType,
      analysisType,
      promptLength: prompt?.length,
      hasImage: !!imageUrl
    });

    if (analysisType === 'quality') {
      // Quality analysis
      const qualityMetrics = await analyzeDesignQuality(prompt, productType, imageUrl);
      
      return new Response(JSON.stringify(qualityMetrics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Validation analysis
      const validationResult = await validateDesignFeasibility(prompt, productType, imageUrl, requirements);
      
      return new Response(JSON.stringify(validationResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Design validation error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Design validation failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeDesignQuality(prompt: string, productType: string, imageUrl?: string) {
  // AI-powered quality analysis
  const complexityKeywords = ['intricate', 'detailed', 'ornate', 'complex', 'elaborate'];
  const simplicityKeywords = ['simple', 'minimal', 'basic', 'clean', 'plain'];
  
  const words = prompt.toLowerCase().split(' ');
  let complexity = 5; // Base complexity
  
  complexityKeywords.forEach(keyword => {
    if (words.includes(keyword)) complexity += 1.5;
  });
  
  simplicityKeywords.forEach(keyword => {
    if (words.includes(keyword)) complexity -= 1;
  });
  
  // Product type modifiers
  const productComplexity: Record<string, number> = {
    'jewelry': 8,
    'furniture': 6,
    'clothing': 7,
    'art': 9,
    'electronics': 9,
    'tool': 5,
    'accessory': 4,
    'home-decor': 5
  };
  
  const baseComplexity = productComplexity[productType] || 6;
  complexity = Math.max(1, Math.min(10, (complexity + baseComplexity) / 2));
  
  // Calculate other metrics based on complexity and product type
  const feasibility = Math.max(1, 11 - complexity); // More complex = less feasible
  const manufacturability = complexity < 7 ? 8 : complexity < 9 ? 6 : 4;
  const costEfficiency = complexity < 5 ? 8 : complexity < 8 ? 6 : 4;
  
  const overallScore = (feasibility + manufacturability + costEfficiency + (10 - complexity)) / 4;
  
  const recommendations = [];
  const warnings = [];
  
  if (complexity > 8) {
    recommendations.push('Consider simplifying the design for easier manufacturing');
    warnings.push('High complexity may increase production costs significantly');
  }
  
  if (feasibility < 6) {
    recommendations.push('Add specific material and dimension requirements');
    warnings.push('Current design may be difficult to manufacture');
  }
  
  if (!words.some(w => ['wood', 'metal', 'plastic', 'glass', 'fabric', 'ceramic'].includes(w))) {
    recommendations.push('Specify preferred materials for better cost estimation');
  }
  
  return {
    feasibilityScore: Math.round(feasibility * 10) / 10,
    complexityScore: Math.round(complexity * 10) / 10,
    manufacturabilityScore: Math.round(manufacturability * 10) / 10,
    costEfficiencyScore: Math.round(costEfficiency * 10) / 10,
    overallScore: Math.round(overallScore * 10) / 10,
    recommendations,
    warnings
  };
}

async function validateDesignFeasibility(
  prompt: string, 
  productType: string, 
  imageUrl?: string,
  requirements?: any
) {
  const words = prompt.toLowerCase().split(' ');
  const issues = [];
  
  // Check for problematic requirements
  const problematicWords = ['impossible', 'defying', 'magical', 'levitating', 'transparent-metal'];
  const hasProblems = problematicWords.some(word => words.includes(word));
  
  if (hasProblems) {
    issues.push({
      type: 'error',
      message: 'Design contains physically impossible elements',
      severity: 'high'
    });
  }
  
  // Check for missing specifications
  const hasDimensions = words.some(w => ['cm', 'mm', 'inch', 'foot', 'meter', 'small', 'large', 'medium'].includes(w));
  if (!hasDimensions) {
    issues.push({
      type: 'suggestion',
      message: 'Consider adding size specifications for more accurate manufacturing',
      severity: 'low'
    });
  }
  
  const hasMaterials = words.some(w => ['wood', 'metal', 'plastic', 'glass', 'fabric', 'ceramic', 'leather'].includes(w));
  if (!hasMaterials) {
    issues.push({
      type: 'warning',
      message: 'No specific materials mentioned - this may affect cost estimation',
      severity: 'medium'
    });
  }
  
  // Technical feasibility assessment
  const complexWords = ['intricate', 'detailed', 'complex', 'elaborate', 'ornate'];
  const complexity = complexWords.filter(word => words.includes(word)).length;
  
  let difficulty = 'medium';
  let canManufacture = true;
  
  if (complexity >= 3 || hasProblems) {
    difficulty = 'expert';
    canManufacture = !hasProblems;
  } else if (complexity >= 2) {
    difficulty = 'hard';
  } else if (complexity === 0 && words.some(w => ['simple', 'basic', 'minimal'].includes(w))) {
    difficulty = 'easy';
  }
  
  // Required tools and skills based on product type and complexity
  const toolsMap: Record<string, string[]> = {
    'jewelry': ['precision tools', 'soldering equipment', 'polishing tools'],
    'furniture': ['woodworking tools', 'sanding equipment', 'finishing supplies'],
    'clothing': ['sewing machine', 'cutting tools', 'pressing equipment'],
    'electronics': ['soldering station', 'testing equipment', 'assembly tools'],
    'art': ['sculpting tools', 'painting supplies', 'finishing equipment']
  };
  
  const skillsMap: Record<string, string[]> = {
    'jewelry': ['metalworking', 'gem setting', 'precision crafting'],
    'furniture': ['woodworking', 'joinery', 'finishing'],
    'clothing': ['pattern making', 'sewing', 'fitting'],
    'electronics': ['circuit design', 'soldering', 'testing'],
    'art': ['sculpting', 'painting', 'artistic vision']
  };
  
  const requiredTools = toolsMap[productType] || ['basic tools', 'measuring tools', 'assembly tools'];
  const requiredSkills = skillsMap[productType] || ['basic craftsmanship', 'attention to detail'];
  
  // Material recommendations
  const materialsByType: Record<string, string[]> = {
    'jewelry': ['gold', 'silver', 'platinum', 'gemstones'],
    'furniture': ['hardwood', 'plywood', 'metal hardware', 'finish materials'],
    'clothing': ['cotton', 'wool', 'synthetic fabrics', 'thread'],
    'electronics': ['PCB materials', 'components', 'enclosure materials'],
    'art': ['canvas', 'clay', 'paint', 'protective finish']
  };
  
  const recommendedMaterials = materialsByType[productType] || ['wood', 'metal', 'plastic'];
  
  // Cost estimation
  const baseCosts: Record<string, { min: number; max: number }> = {
    'jewelry': { min: 100, max: 1000 },
    'furniture': { min: 200, max: 800 },
    'clothing': { min: 50, max: 300 },
    'electronics': { min: 150, max: 600 },
    'art': { min: 100, max: 500 }
  };
  
  const costRange = baseCosts[productType] || { min: 75, max: 400 };
  
  // Adjust costs based on complexity
  const complexityMultiplier = 1 + (complexity * 0.3);
  costRange.min = Math.round(costRange.min * complexityMultiplier);
  costRange.max = Math.round(costRange.max * complexityMultiplier);
  
  const isValid = issues.filter(i => i.type === 'error').length === 0;
  const score = isValid ? Math.max(5, 10 - issues.length - complexity) : Math.max(2, 6 - issues.length);
  
  return {
    isValid,
    score: Math.round(score * 10) / 10,
    issues,
    technicalFeasibility: {
      canManufacture,
      estimatedDifficulty: difficulty,
      requiredTools,
      requiredSkills
    },
    materialCompatibility: {
      recommendedMaterials,
      incompatibleMaterials: hasProblems ? ['any physical materials'] : [],
      estimatedCost: {
        min: costRange.min,
        max: costRange.max,
        currency: 'USD'
      }
    }
  };
}