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
    const { designData, productType, quantity, materials, complexity } = await req.json();

    console.log('💰 Production cost estimation request:', {
      productType,
      quantity,
      complexity,
      materialsCount: materials?.length || 0
    });

    const costEstimate = await estimateProductionCost(
      designData, 
      productType, 
      quantity || 1, 
      materials || [], 
      complexity || 5
    );
    
    return new Response(JSON.stringify(costEstimate), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Cost estimation error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Cost estimation failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function estimateProductionCost(
  designData: any,
  productType: string,
  quantity: number,
  materials: string[],
  complexity: number
) {
  // Base cost structure by product type (USD)
  const baseCosts: Record<string, {
    material: number;
    labor: number;
    overhead: number;
    setup: number;
  }> = {
    'jewelry': {
      material: 50,
      labor: 80,
      overhead: 20,
      setup: 30
    },
    'furniture': {
      material: 120,
      labor: 180,
      overhead: 40,
      setup: 80
    },
    'clothing': {
      material: 25,
      labor: 45,
      overhead: 15,
      setup: 25
    },
    'electronics': {
      material: 80,
      labor: 120,
      overhead: 35,
      setup: 60
    },
    'art': {
      material: 40,
      labor: 100,
      overhead: 25,
      setup: 40
    },
    'accessory': {
      material: 20,
      labor: 35,
      overhead: 10,
      setup: 20
    },
    'home-decor': {
      material: 35,
      labor: 60,
      overhead: 20,
      setup: 30
    }
  };

  const baseStructure = baseCosts[productType] || baseCosts['accessory'];

  // Complexity multipliers (1 = simple, 10 = extremely complex)
  const complexityMultiplier = {
    material: 1 + (complexity - 5) * 0.1, // Materials scale less with complexity
    labor: 1 + (complexity - 5) * 0.2,   // Labor scales significantly with complexity
    overhead: 1 + (complexity - 5) * 0.05, // Overhead scales minimally
    setup: 1 + (complexity - 5) * 0.15   // Setup scales moderately with complexity
  };

  // Material cost adjustments based on specified materials
  let materialMultiplier = 1.0;
  const premiumMaterials = ['gold', 'silver', 'platinum', 'hardwood', 'leather', 'silk', 'titanium'];
  const budgetMaterials = ['plastic', 'synthetic', 'particle board', 'polyester', 'aluminum'];

  materials.forEach(material => {
    const lowerMaterial = material.toLowerCase();
    if (premiumMaterials.some(pm => lowerMaterial.includes(pm))) {
      materialMultiplier += 0.8; // Premium materials add 80% to cost
    } else if (budgetMaterials.some(bm => lowerMaterial.includes(bm))) {
      materialMultiplier += 0.2; // Budget materials add 20% to cost
    } else {
      materialMultiplier += 0.4; // Standard materials add 40% to cost
    }
  });

  // Quantity discounts (economies of scale)
  let quantityDiscount = 1.0;
  if (quantity >= 100) {
    quantityDiscount = 0.7; // 30% discount for 100+
  } else if (quantity >= 50) {
    quantityDiscount = 0.8; // 20% discount for 50-99
  } else if (quantity >= 10) {
    quantityDiscount = 0.9; // 10% discount for 10-49
  } else if (quantity >= 5) {
    quantityDiscount = 0.95; // 5% discount for 5-9
  }

  // Calculate individual cost components
  const materialCost = Math.round(
    baseStructure.material * 
    complexityMultiplier.material * 
    materialMultiplier * 
    quantity
  );

  const laborCost = Math.round(
    baseStructure.labor * 
    complexityMultiplier.labor * 
    quantityDiscount * 
    quantity
  );

  const overheadCost = Math.round(
    baseStructure.overhead * 
    complexityMultiplier.overhead * 
    quantity
  );

  const setupCost = Math.round(
    baseStructure.setup * 
    complexityMultiplier.setup
  ); // Setup cost doesn't scale with quantity

  const baseCost = materialCost + laborCost + overheadCost + setupCost;
  const totalCost = baseCost;

  // Price range calculation (typical markup and market variations)
  const minPrice = Math.round(totalCost * 0.85); // 15% potential savings
  const maxPrice = Math.round(totalCost * 1.8);  // 80% potential markup

  // Cost breakdown for transparency
  const breakdown = [
    {
      item: 'Materials',
      cost: materialCost,
      percentage: Math.round((materialCost / totalCost) * 100)
    },
    {
      item: 'Labor',
      cost: laborCost,
      percentage: Math.round((laborCost / totalCost) * 100)
    },
    {
      item: 'Overhead',
      cost: overheadCost,
      percentage: Math.round((overheadCost / totalCost) * 100)
    },
    {
      item: 'Setup & Tooling',
      cost: setupCost,
      percentage: Math.round((setupCost / totalCost) * 100)
    }
  ];

  // Additional insights based on the estimation
  const insights = [];
  
  if (quantity < 5) {
    insights.push('Consider ordering larger quantities for better per-unit pricing');
  }
  
  if (complexity > 8) {
    insights.push('High complexity design - consider simplification for cost savings');
  }
  
  if (materialMultiplier > 2) {
    insights.push('Premium materials significantly impact cost - consider alternatives');
  }
  
  const estimationAccuracy = materials.length > 0 ? 'High' : 'Medium';
  
  return {
    baseCost,
    materialCost,
    laborCost,
    overheadCost,
    setupCost,
    totalCost,
    priceRange: {
      min: minPrice,
      max: maxPrice
    },
    currency: 'USD',
    breakdown,
    metadata: {
      quantity,
      complexityScore: complexity,
      materialMultiplier: Math.round(materialMultiplier * 100) / 100,
      quantityDiscount: Math.round((1 - quantityDiscount) * 100),
      estimationAccuracy,
      insights
    }
  };
}