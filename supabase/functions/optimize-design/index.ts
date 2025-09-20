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
    const { imageUrl, prompt, productType, validationIssues, feasibilityData } = await req.json();

    console.log('🚀 Design optimization request:', {
      productType,
      promptLength: prompt?.length,
      issueCount: validationIssues?.length || 0,
      hasImage: !!imageUrl
    });

    const optimization = await optimizeDesign(prompt, productType, validationIssues, feasibilityData);
    
    return new Response(JSON.stringify(optimization), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Design optimization error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Design optimization failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function optimizeDesign(
  prompt: string, 
  productType: string, 
  validationIssues: any[], 
  feasibilityData: any
) {
  const words = prompt.toLowerCase().split(' ');
  const suggestions = [];
  const alternatives = [];
  
  // Analyze prompt for optimization opportunities
  let optimizedPrompt = prompt;
  
  // Material optimization
  const hasMaterials = words.some(w => ['wood', 'metal', 'plastic', 'glass', 'fabric', 'ceramic'].includes(w));
  if (!hasMaterials) {
    const materialSuggestions: Record<string, string[]> = {
      'jewelry': ['sterling silver', 'gold-plated', 'hypoallergenic materials'],
      'furniture': ['sustainable hardwood', 'engineered wood', 'powder-coated metal'],
      'clothing': ['organic cotton', 'bamboo fiber', 'recycled polyester'],
      'electronics': ['recyclable plastics', 'aluminum housing', 'lead-free components'],
      'art': ['archival materials', 'non-toxic paints', 'sustainable canvas']
    };
    
    const recommendedMaterials = materialSuggestions[productType] || ['eco-friendly materials'];
    const materialToAdd = recommendedMaterials[0];
    
    suggestions.push({
      aspect: 'materials',
      original: 'unspecified materials',
      suggested: `using ${materialToAdd}`,
      reasoning: 'Specifying materials improves cost accuracy and manufacturing planning',
      impact: 'cost'
    });
    
    optimizedPrompt += ` using ${materialToAdd}`;
  }
  
  // Size/dimension optimization
  const hasDimensions = words.some(w => ['cm', 'mm', 'inch', 'small', 'large', 'medium'].includes(w));
  if (!hasDimensions) {
    const sizeSuggestions: Record<string, string> = {
      'jewelry': 'standard size',
      'furniture': 'compact design',
      'clothing': 'standard fit',
      'electronics': 'portable size',
      'art': 'medium scale'
    };
    
    const sizeToAdd = sizeSuggestions[productType] || 'appropriately sized';
    
    suggestions.push({
      aspect: 'dimensions',
      original: 'unspecified size',
      suggested: sizeToAdd,
      reasoning: 'Clear dimensions help with material planning and cost estimation',
      impact: 'manufacturability'
    });
    
    optimizedPrompt += ` in ${sizeToAdd}`;
  }
  
  // Complexity optimization based on difficulty
  if (feasibilityData?.estimatedDifficulty === 'expert' || feasibilityData?.estimatedDifficulty === 'hard') {
    suggestions.push({
      aspect: 'complexity',
      original: 'highly complex design',
      suggested: 'simplified version with clean lines',
      reasoning: 'Reducing complexity decreases manufacturing time and cost while maintaining aesthetic appeal',
      impact: 'time'
    });
    
    // Create simplified version of prompt
    const complexWords = ['intricate', 'ornate', 'elaborate', 'detailed', 'complex'];
    let simplifiedPrompt = prompt;
    complexWords.forEach(word => {
      simplifiedPrompt = simplifiedPrompt.replace(new RegExp(word, 'gi'), 'clean');
    });
    simplifiedPrompt += ' with minimalist design principles';
    
    alternatives.push({
      variant: 'Simplified Version',
      description: 'A cleaner, more minimalist interpretation that maintains the core concept',
      benefits: [
        'Reduced manufacturing complexity',
        'Lower production costs',
        'Shorter lead times',
        'Easier quality control'
      ],
      tradeoffs: [
        'Less ornate details',
        'Simpler finish options',
        'Reduced customization'
      ]
    });
  }
  
  // Sustainability optimization
  const sustainabilityWords = ['eco', 'sustainable', 'recycled', 'green', 'organic'];
  const hasSustainability = sustainabilityWords.some(word => words.includes(word));
  
  if (!hasSustainability) {
    suggestions.push({
      aspect: 'sustainability',
      original: 'conventional materials',
      suggested: 'eco-friendly and sustainable materials',
      reasoning: 'Sustainable materials appeal to environmentally conscious consumers and may qualify for green certifications',
      impact: 'quality'
    });
    
    alternatives.push({
      variant: 'Eco-Friendly Version',
      description: 'An environmentally conscious version using sustainable materials and processes',
      benefits: [
        'Appeals to eco-conscious consumers',
        'Potential for green certifications',
        'Reduced environmental impact',
        'Often higher perceived value'
      ],
      tradeoffs: [
        'Potentially higher material costs',
        'Limited material options',
        'May require specialized suppliers'
      ]
    });
  }
  
  // Modular design optimization for complex products
  if (['furniture', 'electronics'].includes(productType)) {
    alternatives.push({
      variant: 'Modular Design',
      description: 'A modular approach that allows for easier assembly, customization, and shipping',
      benefits: [
        'Easier shipping and handling',
        'Customer assembly options',
        'Customization possibilities',
        'Simplified manufacturing'
      ],
      tradeoffs: [
        'More complex assembly instructions',
        'Additional hardware required',
        'Potential for assembly errors'
      ]
    });
  }
  
  // Premium version for luxury markets
  if (['jewelry', 'art', 'furniture'].includes(productType)) {
    alternatives.push({
      variant: 'Premium Edition',
      description: 'A luxury version with high-end materials and enhanced craftsmanship',
      benefits: [
        'Higher profit margins',
        'Premium market positioning',
        'Enhanced durability',
        'Collectible value'
      ],
      tradeoffs: [
        'Significantly higher costs',
        'Longer production times',
        'Smaller target market',
        'Higher skill requirements'
      ]
    });
  }
  
  // Budget-friendly alternative
  alternatives.push({
    variant: 'Budget-Friendly Version',
    description: 'A cost-optimized version that maintains core functionality while reducing expenses',
    benefits: [
      'Lower retail price point',
      'Broader market appeal',
      'Faster production',
      'Reduced material waste'
    ],
    tradeoffs: [
      'Simpler materials',
      'Less premium feel',
      'Reduced feature set',
      'Lower perceived value'
    ]
  });
  
  // Address specific validation issues
  validationIssues?.forEach((issue: any) => {
    if (issue.type === 'error' && issue.message.includes('impossible')) {
      suggestions.push({
        aspect: 'feasibility',
        original: 'physically impossible elements',
        suggested: 'achievable design elements',
        reasoning: 'Removing impossible elements makes the design manufacturable',
        impact: 'manufacturability'
      });
    }
    
    if (issue.message.includes('cost estimation')) {
      suggestions.push({
        aspect: 'cost clarity',
        original: 'unclear cost factors',
        suggested: 'specific material and size requirements',
        reasoning: 'Clear specifications enable accurate cost estimation and quoting',
        impact: 'cost'
      });
    }
  });
  
  // Final optimization of the prompt
  optimizedPrompt += ' with efficient manufacturing in mind, optimized for quality and cost-effectiveness';
  
  return {
    optimizedPrompt: optimizedPrompt.trim(),
    suggestedModifications: suggestions,
    alternativeDesigns: alternatives
  };
}