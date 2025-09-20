import { supabase } from '@/integrations/supabase/client';

export interface QuoteRequest {
  designId?: string;
  productionRoute?: string;
  materials: string[];
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  quantity: number;
  timeline: number; // days
  customizations?: string[];
  qualityLevel: 'basic' | 'premium' | 'luxury';
}

export interface QuoteResult {
  id: string;
  basePrice: number;
  finalPrice: number;
  breakdown: {
    materials: number;
    labor: number;
    overhead: number;
    customizations: number;
    urgency: number;
  };
  timeline: number;
  confidence: number; // 0-1
  alternatives: QuoteAlternative[];
  validUntil: string;
}

export interface QuoteAlternative {
  title: string;
  description: string;
  priceChange: number;
  timelineChange: number;
  modifications: string[];
}

export interface PricingFactors {
  materialComplexity: number;
  designComplexity: number;
  quantityDiscount: number;
  timelinePremium: number;
  qualityMultiplier: number;
  marketDemand: number;
}

class QuoteEngine {
  private static instance: QuoteEngine;
  
  static getInstance(): QuoteEngine {
    if (!QuoteEngine.instance) {
      QuoteEngine.instance = new QuoteEngine();
    }
    return QuoteEngine.instance;
  }

  async generateQuote(request: QuoteRequest): Promise<QuoteResult> {
    try {
      console.log('🧮 Generating intelligent quote:', request);

      // Get pricing factors
      const factors = await this.calculatePricingFactors(request);
      
      // Calculate base pricing
      const basePricing = await this.calculateBasePricing(request, factors);
      
      // Generate alternatives
      const alternatives = await this.generateAlternatives(request, basePricing);
      
      // Calculate final quote
      const quote: QuoteResult = {
        id: crypto.randomUUID(),
        basePrice: basePricing.base,
        finalPrice: basePricing.final,
        breakdown: basePricing.breakdown,
        timeline: this.calculateTimeline(request, factors),
        confidence: this.calculateConfidence(request, factors),
        alternatives,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Store quote for future reference
      await this.storeQuote(quote, request);
      
      console.log('✅ Quote generated:', quote);
      return quote;
    } catch (error) {
      console.error('❌ Quote generation failed:', error);
      throw new Error('Failed to generate quote');
    }
  }

  private async calculatePricingFactors(request: QuoteRequest): Promise<PricingFactors> {
    // Material complexity based on materials used
    const materialComplexity = this.assessMaterialComplexity(request.materials);
    
    // Design complexity (would integrate with design validation)
    const designComplexity = await this.assessDesignComplexity(request);
    
    // Quantity discount calculation
    const quantityDiscount = this.calculateQuantityDiscount(request.quantity);
    
    // Timeline premium for rush orders
    const timelinePremium = this.calculateTimelinePremium(request.timeline);
    
    // Quality level multiplier
    const qualityMultiplier = this.getQualityMultiplier(request.qualityLevel);
    
    // Market demand factors
    const marketDemand = await this.getMarketDemand(request.materials);

    return {
      materialComplexity,
      designComplexity,
      quantityDiscount,
      timelinePremium,
      qualityMultiplier,
      marketDemand
    };
  }

  private async calculateBasePricing(request: QuoteRequest, factors: PricingFactors) {
    // Base material costs
    const materialCost = await this.calculateMaterialCosts(request.materials, request.dimensions, request.quantity);
    
    // Labor costs based on complexity and production route
    const laborCost = this.calculateLaborCosts(request, factors);
    
    // Overhead and operational costs
    const overheadCost = this.calculateOverheadCosts(materialCost + laborCost);
    
    // Customization costs
    const customizationCost = this.calculateCustomizationCosts(request.customizations || []);
    
    // Apply urgency premium
    const urgencyCost = (materialCost + laborCost) * (factors.timelinePremium - 1);

    const baseCost = materialCost + laborCost + overheadCost;
    const totalAdditions = customizationCost + urgencyCost;
    
    // Apply quality multiplier and quantity discount
    const finalPrice = (baseCost + totalAdditions) * factors.qualityMultiplier * (1 - factors.quantityDiscount);

    return {
      base: baseCost,
      final: Math.round(finalPrice * 100) / 100,
      breakdown: {
        materials: Math.round(materialCost * 100) / 100,
        labor: Math.round(laborCost * 100) / 100,
        overhead: Math.round(overheadCost * 100) / 100,
        customizations: Math.round(customizationCost * 100) / 100,
        urgency: Math.round(urgencyCost * 100) / 100
      }
    };
  }

  private assessMaterialComplexity(materials: string[]): number {
    const complexityMap: Record<string, number> = {
      'cotton': 1.0,
      'polyester': 1.1,
      'silk': 1.8,
      'wool': 1.6,
      'cashmere': 2.5,
      'leather': 2.2,
      'suede': 2.0,
      'denim': 1.3,
      'linen': 1.4,
      'bamboo': 1.5
    };

    const avgComplexity = materials.reduce((sum, material) => {
      return sum + (complexityMap[material.toLowerCase()] || 1.2);
    }, 0) / materials.length;

    return Math.min(avgComplexity, 3.0);
  }

  private async assessDesignComplexity(request: QuoteRequest): Promise<number> {
    // This would integrate with the design validation service
    // For now, use heuristics based on customizations and dimensions
    let complexity = 1.0;
    
    // Complex dimensions
    const volume = request.dimensions.width * request.dimensions.height * (request.dimensions.depth || 1);
    if (volume > 1000) complexity += 0.3;
    
    // Customizations add complexity
    const customizationCount = request.customizations?.length || 0;
    complexity += customizationCount * 0.2;
    
    return Math.min(complexity, 2.5);
  }

  private calculateQuantityDiscount(quantity: number): number {
    if (quantity >= 100) return 0.15;
    if (quantity >= 50) return 0.10;
    if (quantity >= 20) return 0.05;
    if (quantity >= 10) return 0.02;
    return 0;
  }

  private calculateTimelinePremium(timeline: number): number {
    if (timeline <= 3) return 1.5; // Rush order
    if (timeline <= 7) return 1.2; // Fast turnaround
    if (timeline <= 14) return 1.0; // Standard
    return 0.9; // Patient customer discount
  }

  private getQualityMultiplier(quality: string): number {
    const multipliers = {
      'basic': 0.8,
      'premium': 1.0,
      'luxury': 1.6
    };
    return multipliers[quality as keyof typeof multipliers] || 1.0;
  }

  private async getMarketDemand(materials: string[]): Promise<number> {
    // This would integrate with market data APIs
    // For now, return base demand factor
    return 1.0;
  }

  private async calculateMaterialCosts(materials: string[], dimensions: any, quantity: number): Promise<number> {
    // Base material costs per unit
    const materialPrices: Record<string, number> = {
      'cotton': 12,
      'polyester': 8,
      'silk': 45,
      'wool': 35,
      'cashmere': 120,
      'leather': 60,
      'suede': 50,
      'denim': 18,
      'linen': 25,
      'bamboo': 22
    };

    const baseCost = materials.reduce((sum, material) => {
      return sum + (materialPrices[material.toLowerCase()] || 15);
    }, 0);

    // Factor in dimensions (simplified calculation)
    const sizeFactor = Math.sqrt(dimensions.width * dimensions.height) / 100;
    
    return baseCost * sizeFactor * quantity;
  }

  private calculateLaborCosts(request: QuoteRequest, factors: PricingFactors): number {
    const baseLabor = 25; // Base hourly rate
    const estimatedHours = 2 + (factors.designComplexity - 1) * 3;
    return baseLabor * estimatedHours * request.quantity;
  }

  private calculateOverheadCosts(directCosts: number): number {
    return directCosts * 0.3; // 30% overhead
  }

  private calculateCustomizationCosts(customizations: string[]): number {
    return customizations.length * 15; // $15 per customization
  }

  private calculateTimeline(request: QuoteRequest, factors: PricingFactors): number {
    let baseTimeline = request.timeline;
    
    // Adjust for complexity
    baseTimeline *= factors.designComplexity;
    
    // Adjust for quantity
    if (request.quantity > 50) baseTimeline *= 1.5;
    else if (request.quantity > 20) baseTimeline *= 1.2;
    
    return Math.ceil(baseTimeline);
  }

  private calculateConfidence(request: QuoteRequest, factors: PricingFactors): number {
    let confidence = 0.8; // Base confidence
    
    // Higher confidence for standard materials
    if (request.materials.every(m => ['cotton', 'polyester', 'denim'].includes(m.toLowerCase()))) {
      confidence += 0.1;
    }
    
    // Lower confidence for complex designs
    if (factors.designComplexity > 1.5) confidence -= 0.1;
    
    // Lower confidence for rush orders
    if (factors.timelinePremium > 1.2) confidence -= 0.15;
    
    return Math.max(0.5, Math.min(0.95, confidence));
  }

  private async generateAlternatives(request: QuoteRequest, basePricing: any): Promise<QuoteAlternative[]> {
    const alternatives: QuoteAlternative[] = [];

    // Material alternatives
    if (request.materials.includes('silk') || request.materials.includes('cashmere')) {
      alternatives.push({
        title: 'Standard Materials',
        description: 'Use cotton or polyester blend for cost savings',
        priceChange: -basePricing.final * 0.3,
        timelineChange: -2,
        modifications: ['Replace premium materials with standard options']
      });
    }

    // Quality alternatives
    if (request.qualityLevel === 'luxury') {
      alternatives.push({
        title: 'Premium Quality',
        description: 'Reduce to premium quality level',
        priceChange: -basePricing.final * 0.2,
        timelineChange: -1,
        modifications: ['Adjust quality specifications to premium level']
      });
    }

    // Timeline alternatives
    if (request.timeline <= 7) {
      alternatives.push({
        title: 'Extended Timeline',
        description: 'Allow 14+ days for standard pricing',
        priceChange: -basePricing.final * 0.15,
        timelineChange: 7,
        modifications: ['Remove rush order premium']
      });
    }

    // Quantity alternatives
    if (request.quantity < 20) {
      const newQuantity = Math.max(20, request.quantity * 2);
      alternatives.push({
        title: 'Bulk Order',
        description: `Increase quantity to ${newQuantity} for volume discount`,
        priceChange: -basePricing.final * 0.08 * request.quantity,
        timelineChange: 3,
        modifications: [`Increase quantity to ${newQuantity} units for better pricing`]
      });
    }

    return alternatives;
  }

  private async storeQuote(quote: QuoteResult, request: QuoteRequest): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_content_history').insert([{
          content_type: 'quote_generation',
          input_data: request as any,
          generated_content: quote as any,
          model_used: 'quote_engine_v1',
          quality_score: quote.confidence,
          user_id: user.id
        }]);
      }
    } catch (error) {
      console.warn('Failed to store quote:', error);
    }
  }

  async compareQuotes(quotes: QuoteResult[]): Promise<{
    bestValue: QuoteResult;
    fastest: QuoteResult;
    cheapest: QuoteResult;
    analysis: string;
  }> {
    if (quotes.length === 0) {
      throw new Error('No quotes to compare');
    }

    const cheapest = quotes.reduce((min, quote) => 
      quote.finalPrice < min.finalPrice ? quote : min
    );

    const fastest = quotes.reduce((min, quote) => 
      quote.timeline < min.timeline ? quote : min
    );

    // Best value = balance of price, timeline, and confidence
    const bestValue = quotes.reduce((best, quote) => {
      const valueScore = (1 / quote.finalPrice) * (1 / quote.timeline) * quote.confidence;
      const bestScore = (1 / best.finalPrice) * (1 / best.timeline) * best.confidence;
      return valueScore > bestScore ? quote : best;
    });

    const analysis = this.generateQuoteAnalysis(quotes, { bestValue, fastest, cheapest });

    return { bestValue, fastest, cheapest, analysis };
  }

  private generateQuoteAnalysis(quotes: QuoteResult[], recommendations: any): string {
    const priceRange = Math.max(...quotes.map(q => q.finalPrice)) - Math.min(...quotes.map(q => q.finalPrice));
    const timeRange = Math.max(...quotes.map(q => q.timeline)) - Math.min(...quotes.map(q => q.timeline));
    
    let analysis = `Analyzed ${quotes.length} quotes with price range of $${priceRange.toFixed(2)} and timeline range of ${timeRange} days. `;
    
    if (recommendations.bestValue.id === recommendations.cheapest.id) {
      analysis += 'The cheapest option also offers the best overall value. ';
    } else {
      analysis += `The best value option costs $${(recommendations.bestValue.finalPrice - recommendations.cheapest.finalPrice).toFixed(2)} more but offers better balance of quality and timeline. `;
    }
    
    return analysis;
  }
}

export const quoteEngine = QuoteEngine.getInstance();