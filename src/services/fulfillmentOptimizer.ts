import { supabase } from '@/integrations/supabase/client';

export interface ShippingOption {
  id: string;
  carrier: string;
  service: string;
  estimatedDays: number;
  cost: number;
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
  signatureRequired: boolean;
  sustainability: 'standard' | 'eco_friendly' | 'carbon_neutral';
  reliability: number; // 0-1
}

export interface PackagingOption {
  id: string;
  type: 'standard' | 'premium' | 'eco_friendly' | 'custom_branded';
  material: string;
  dimensions: { length: number; width: number; height: number };
  weight: number;
  cost: number;
  protection: 'basic' | 'enhanced' | 'maximum';
  customization: string[];
  sustainability: number; // 0-1
}

export interface FulfillmentRequest {
  orderId: string;
  items: Array<{
    productId: string;
    quantity: number;
    dimensions: { length: number; width: number; height: number };
    weight: number;
    fragile: boolean;
    value: number;
  }>;
  destination: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customerPreferences: {
    speed: 'standard' | 'fast' | 'express';
    cost: 'economy' | 'balanced' | 'premium';
    sustainability: 'standard' | 'eco_preferred' | 'carbon_neutral_only';
  };
  specialRequirements?: string[];
}

export interface FulfillmentPlan {
  id: string;
  orderId: string;
  recommendedPackaging: PackagingOption;
  recommendedShipping: ShippingOption;
  alternatives: {
    packaging: PackagingOption[];
    shipping: ShippingOption[];
  };
  totalCost: number;
  estimatedDelivery: string;
  carbonFootprint: number; // kg CO2
  confidence: number;
  optimizationScore: number;
  instructions: string[];
}

export interface ShipmentTracking {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'preparing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  currentLocation?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  deliveryAttempts: number;
  customerNotifications: NotificationEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface NotificationEvent {
  timestamp: string;
  type: 'email' | 'sms' | 'push';
  message: string;
  status: 'sent' | 'delivered' | 'failed';
}

class FulfillmentOptimizer {
  private static instance: FulfillmentOptimizer;
  
  static getInstance(): FulfillmentOptimizer {
    if (!FulfillmentOptimizer.instance) {
      FulfillmentOptimizer.instance = new FulfillmentOptimizer();
    }
    return FulfillmentOptimizer.instance;
  }

  async optimizeFulfillment(request: FulfillmentRequest): Promise<FulfillmentPlan> {
    try {
      console.log('📦 Optimizing fulfillment for order:', request.orderId);

      // Analyze packaging requirements
      const packagingOptions = await this.analyzePackagingNeeds(request);
      
      // Get shipping options
      const shippingOptions = await this.getShippingOptions(request, packagingOptions[0]);
      
      // Apply optimization algorithms
      const optimizedPlan = await this.selectOptimalOptions(
        request, 
        packagingOptions, 
        shippingOptions
      );
      
      // Generate fulfillment instructions
      const instructions = this.generateFulfillmentInstructions(optimizedPlan);
      
      const plan: FulfillmentPlan = {
        id: crypto.randomUUID(),
        orderId: request.orderId,
        recommendedPackaging: optimizedPlan.packaging,
        recommendedShipping: optimizedPlan.shipping,
        alternatives: {
          packaging: packagingOptions.slice(1, 4),
          shipping: shippingOptions.slice(1, 4)
        },
        totalCost: optimizedPlan.packaging.cost + optimizedPlan.shipping.cost,
        estimatedDelivery: this.calculateDeliveryDate(optimizedPlan.shipping.estimatedDays),
        carbonFootprint: this.calculateCarbonFootprint(optimizedPlan),
        confidence: optimizedPlan.confidence,
        optimizationScore: optimizedPlan.score,
        instructions
      };

      // Store fulfillment plan
      await this.storeFulfillmentPlan(plan);
      
      console.log('✅ Fulfillment plan optimized:', plan);
      return plan;
    } catch (error) {
      console.error('❌ Fulfillment optimization failed:', error);
      throw new Error('Failed to optimize fulfillment');
    }
  }

  private async analyzePackagingNeeds(request: FulfillmentRequest): Promise<PackagingOption[]> {
    const totalVolume = request.items.reduce((sum, item) => 
      sum + (item.dimensions.length * item.dimensions.width * item.dimensions.height * item.quantity), 0
    );
    
    const totalWeight = request.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const totalValue = request.items.reduce((sum, item) => sum + (item.value * item.quantity), 0);
    const hasFragileItems = request.items.some(item => item.fragile);

    const options: PackagingOption[] = [];

    // Standard packaging
    options.push({
      id: 'standard-box',
      type: 'standard',
      material: 'corrugated_cardboard',
      dimensions: this.calculateBoxDimensions(totalVolume),
      weight: Math.max(0.5, totalWeight * 0.1),
      cost: 3.50,
      protection: hasFragileItems ? 'enhanced' : 'basic',
      customization: [],
      sustainability: 0.6
    });

    // Eco-friendly option
    if (request.customerPreferences.sustainability === 'eco_preferred' || 
        request.customerPreferences.sustainability === 'carbon_neutral_only') {
      options.push({
        id: 'eco-box',
        type: 'eco_friendly',
        material: 'recycled_cardboard',
        dimensions: this.calculateBoxDimensions(totalVolume),
        weight: Math.max(0.4, totalWeight * 0.08),
        cost: 4.25,
        protection: hasFragileItems ? 'enhanced' : 'basic',
        customization: ['biodegradable_padding', 'recycled_tape'],
        sustainability: 0.9
      });
    }

    // Premium packaging for high-value items
    if (totalValue > 100 || request.customerPreferences.cost === 'premium') {
      options.push({
        id: 'premium-box',
        type: 'premium',
        material: 'rigid_cardboard',
        dimensions: this.calculateBoxDimensions(totalVolume, 1.2), // 20% larger for premium presentation
        weight: Math.max(0.8, totalWeight * 0.15),
        cost: 8.50,
        protection: 'maximum',
        customization: ['foam_inserts', 'tissue_paper', 'thank_you_card'],
        sustainability: 0.7
      });
    }

    // Custom branded packaging
    options.push({
      id: 'branded-box',
      type: 'custom_branded',
      material: 'custom_printed_cardboard',
      dimensions: this.calculateBoxDimensions(totalVolume, 1.1),
      weight: Math.max(0.6, totalWeight * 0.12),
      cost: 6.75,
      protection: 'enhanced',
      customization: ['brand_logo', 'custom_colors', 'marketing_insert'],
      sustainability: 0.65
    });

    return this.sortPackagingByPreference(options, request.customerPreferences);
  }

  private async getShippingOptions(
    request: FulfillmentRequest, 
    packaging: PackagingOption
  ): Promise<ShippingOption[]> {
    const distance = await this.calculateDistance(request.destination);
    const packageWeight = packaging.weight + request.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    
    const options: ShippingOption[] = [
      {
        id: 'usps-ground',
        carrier: 'USPS',
        service: 'Ground Advantage',
        estimatedDays: Math.max(3, Math.floor(distance / 500) + 2),
        cost: this.calculateShippingCost('usps', 'ground', packageWeight, distance),
        trackingIncluded: true,
        insuranceIncluded: false,
        signatureRequired: false,
        sustainability: 'standard',
        reliability: 0.92
      },
      {
        id: 'ups-ground',
        carrier: 'UPS',
        service: 'Ground',
        estimatedDays: Math.max(2, Math.floor(distance / 600) + 1),
        cost: this.calculateShippingCost('ups', 'ground', packageWeight, distance),
        trackingIncluded: true,
        insuranceIncluded: true,
        signatureRequired: false,
        sustainability: 'standard',
        reliability: 0.95
      },
      {
        id: 'fedex-2day',
        carrier: 'FedEx',
        service: '2Day',
        estimatedDays: 2,
        cost: this.calculateShippingCost('fedex', '2day', packageWeight, distance),
        trackingIncluded: true,
        insuranceIncluded: true,
        signatureRequired: false,
        sustainability: 'standard',
        reliability: 0.97
      },
      {
        id: 'fedex-overnight',
        carrier: 'FedEx',
        service: 'Priority Overnight',
        estimatedDays: 1,
        cost: this.calculateShippingCost('fedex', 'overnight', packageWeight, distance),
        trackingIncluded: true,
        insuranceIncluded: true,
        signatureRequired: true,
        sustainability: 'standard',
        reliability: 0.98
      }
    ];

    // Add eco-friendly options if preferred
    if (request.customerPreferences.sustainability !== 'standard') {
      options.push({
        id: 'ups-carbon-neutral',
        carrier: 'UPS',
        service: 'Ground (Carbon Neutral)',
        estimatedDays: Math.max(3, Math.floor(distance / 500) + 2),
        cost: this.calculateShippingCost('ups', 'ground', packageWeight, distance) * 1.15,
        trackingIncluded: true,
        insuranceIncluded: true,
        signatureRequired: false,
        sustainability: 'carbon_neutral',
        reliability: 0.94
      });
    }

    return this.sortShippingByPreference(options, request.customerPreferences);
  }

  private async selectOptimalOptions(
    request: FulfillmentRequest,
    packagingOptions: PackagingOption[],
    shippingOptions: ShippingOption[]
  ): Promise<{
    packaging: PackagingOption;
    shipping: ShippingOption;
    confidence: number;
    score: number;
  }> {
    let bestScore = 0;
    let bestPackaging = packagingOptions[0];
    let bestShipping = shippingOptions[0];

    for (const packaging of packagingOptions.slice(0, 3)) {
      for (const shipping of shippingOptions.slice(0, 3)) {
        const score = this.calculateOptimizationScore(request, packaging, shipping);
        
        if (score > bestScore) {
          bestScore = score;
          bestPackaging = packaging;
          bestShipping = shipping;
        }
      }
    }

    const confidence = this.calculateConfidence(request, bestPackaging, bestShipping);

    return {
      packaging: bestPackaging,
      shipping: bestShipping,
      confidence,
      score: bestScore
    };
  }

  private calculateOptimizationScore(
    request: FulfillmentRequest,
    packaging: PackagingOption,
    shipping: ShippingOption
  ): number {
    let score = 0;

    // Cost optimization (30% weight)
    const totalCost = packaging.cost + shipping.cost;
    const costScore = Math.max(0, 1 - (totalCost / 50)); // Normalize against $50 baseline
    score += costScore * 0.3;

    // Speed optimization (25% weight)
    const speedScore = request.customerPreferences.speed === 'express' ? 
      (1 - (shipping.estimatedDays / 7)) : // Faster is better for express
      (shipping.estimatedDays <= 5 ? 0.8 : 0.5); // Standard preference
    score += speedScore * 0.25;

    // Sustainability (20% weight)
    const sustainabilityWeight = request.customerPreferences.sustainability === 'carbon_neutral_only' ? 1.0 :
                                request.customerPreferences.sustainability === 'eco_preferred' ? 0.7 : 0.3;
    const sustainabilityScore = (packaging.sustainability + (shipping.sustainability === 'carbon_neutral' ? 1 : 0.6)) / 2;
    score += sustainabilityScore * sustainabilityWeight * 0.2;

    // Reliability (15% weight)
    score += shipping.reliability * 0.15;

    // Protection (10% weight)
    const protectionScore = packaging.protection === 'maximum' ? 1 : 
                          packaging.protection === 'enhanced' ? 0.8 : 0.6;
    score += protectionScore * 0.1;

    return Math.min(1, score);
  }

  private calculateConfidence(
    request: FulfillmentRequest,
    packaging: PackagingOption,
    shipping: ShippingOption
  ): number {
    let confidence = 0.8; // Base confidence

    // Higher confidence for standard requirements
    if (request.customerPreferences.speed === 'standard') confidence += 0.1;
    if (request.customerPreferences.cost === 'balanced') confidence += 0.05;

    // Lower confidence for complex requirements
    if (request.items.some(item => item.fragile)) confidence -= 0.05;
    if (request.specialRequirements?.length) confidence -= 0.1;

    // Carrier reliability factor
    confidence += (shipping.reliability - 0.9) * 0.5;

    return Math.max(0.5, Math.min(0.98, confidence));
  }

  private calculateBoxDimensions(volume: number, factor: number = 1): { length: number; width: number; height: number } {
    const adjustedVolume = volume * factor * 1.3; // Add 30% for packing material
    const side = Math.cbrt(adjustedVolume);
    
    return {
      length: Math.ceil(side * 1.2), // Slightly rectangular for efficiency
      width: Math.ceil(side),
      height: Math.ceil(side * 0.8)
    };
  }

  private calculateDistance(destination: FulfillmentRequest['destination']): Promise<number> {
    // Mock distance calculation - in reality would use geo API
    const stateMiles: Record<string, number> = {
      'CA': 800, 'NY': 1200, 'TX': 900, 'FL': 1100, 'IL': 700
    };
    return Promise.resolve(stateMiles[destination.state] || 800);
  }

  private calculateShippingCost(carrier: string, service: string, weight: number, distance: number): number {
    const baseCosts = {
      usps: { ground: 8.50 },
      ups: { ground: 12.50 },
      fedex: { ground: 11.75, '2day': 25.50, overnight: 65.00 }
    };

    const base = (baseCosts as any)[carrier]?.[service] || 10;
    const weightFactor = Math.max(1, weight / 2);
    const distanceFactor = Math.max(1, distance / 1000);

    return Math.round((base * weightFactor * distanceFactor) * 100) / 100;
  }

  private calculateDeliveryDate(days: number): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate.toISOString();
  }

  private calculateCarbonFootprint(plan: { packaging: PackagingOption; shipping: ShippingOption }): number {
    const packagingFootprint = (1 - plan.packaging.sustainability) * 0.5;
    const shippingFootprint = plan.shipping.sustainability === 'carbon_neutral' ? 0 : 2.5;
    return Math.round((packagingFootprint + shippingFootprint) * 100) / 100;
  }

  private generateFulfillmentInstructions(plan: any): string[] {
    const instructions: string[] = [];

    instructions.push(`Use ${plan.packaging.material} packaging with ${plan.packaging.protection} protection`);
    
    if (plan.packaging.customization.length > 0) {
      instructions.push(`Include: ${plan.packaging.customization.join(', ')}`);
    }

    instructions.push(`Ship via ${plan.shipping.carrier} ${plan.shipping.service}`);
    
    if (plan.shipping.signatureRequired) {
      instructions.push('Signature required upon delivery');
    }

    if (plan.shipping.insuranceIncluded) {
      instructions.push('Package includes insurance coverage');
    }

    return instructions;
  }

  private sortPackagingByPreference(
    options: PackagingOption[], 
    preferences: FulfillmentRequest['customerPreferences']
  ): PackagingOption[] {
    return options.sort((a, b) => {
      if (preferences.sustainability === 'carbon_neutral_only' || preferences.sustainability === 'eco_preferred') {
        return b.sustainability - a.sustainability;
      }
      if (preferences.cost === 'economy') {
        return a.cost - b.cost;
      }
      if (preferences.cost === 'premium') {
        return b.cost - a.cost;
      }
      return 0; // balanced - keep original order
    });
  }

  private sortShippingByPreference(
    options: ShippingOption[], 
    preferences: FulfillmentRequest['customerPreferences']
  ): ShippingOption[] {
    return options.sort((a, b) => {
      if (preferences.speed === 'express') {
        return a.estimatedDays - b.estimatedDays;
      }
      if (preferences.cost === 'economy') {
        return a.cost - b.cost;
      }
      if (preferences.sustainability === 'carbon_neutral_only') {
        if (a.sustainability === 'carbon_neutral' && b.sustainability !== 'carbon_neutral') return -1;
        if (b.sustainability === 'carbon_neutral' && a.sustainability !== 'carbon_neutral') return 1;
      }
      return b.reliability - a.reliability; // Prefer more reliable
    });
  }

  private async storeFulfillmentPlan(plan: FulfillmentPlan): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_content_history').insert([{
          content_type: 'fulfillment_plan',
          input_data: { orderId: plan.orderId } as any,
          generated_content: plan as any,
          model_used: 'fulfillment_optimizer_v1',
          quality_score: plan.confidence,
          user_id: user.id
        }]);
      }
    } catch (error) {
      console.warn('Failed to store fulfillment plan:', error);
    }
  }

  async createShipment(
    fulfillmentPlan: FulfillmentPlan,
    actualWeight?: number
  ): Promise<ShipmentTracking> {
    try {
      console.log('🚚 Creating shipment for order:', fulfillmentPlan.orderId);

      // Generate tracking number (mock)
      const trackingNumber = this.generateTrackingNumber(fulfillmentPlan.recommendedShipping.carrier);

      const shipment: ShipmentTracking = {
        id: crypto.randomUUID(),
        orderId: fulfillmentPlan.orderId,
        trackingNumber,
        carrier: fulfillmentPlan.recommendedShipping.carrier,
        status: 'preparing',
        estimatedDelivery: fulfillmentPlan.estimatedDelivery,
        events: [{
          timestamp: new Date().toISOString(),
          location: 'Fulfillment Center',
          status: 'preparing',
          description: 'Package is being prepared for shipment'
        }],
        deliveryAttempts: 0,
        customerNotifications: []
      };

      await this.storeShipmentTracking(shipment);
      
      console.log('✅ Shipment created:', shipment);
      return shipment;
    } catch (error) {
      console.error('❌ Shipment creation failed:', error);
      throw new Error('Failed to create shipment');
    }
  }

  private generateTrackingNumber(carrier: string): string {
    const prefixes = { 'UPS': '1Z', 'FedEx': '96', 'USPS': '94' };
    const prefix = prefixes[carrier as keyof typeof prefixes] || '12';
    const random = Math.random().toString(36).substr(2, 12).toUpperCase();
    return `${prefix}${random}`;
  }

  private async storeShipmentTracking(shipment: ShipmentTracking): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_content_history').insert([{
          content_type: 'shipment_tracking',
          input_data: { orderId: shipment.orderId } as any,
          generated_content: shipment as any,
          model_used: 'fulfillment_tracker_v1',
          quality_score: 1.0,
          user_id: user.id
        }]);
      }
    } catch (error) {
      console.warn('Failed to store shipment tracking:', error);
    }
  }

  async updateShipmentStatus(
    trackingId: string,
    status: ShipmentTracking['status'],
    location?: string,
    description?: string
  ): Promise<void> {
    console.log(`📍 Updating shipment ${trackingId} status to ${status}`);
    
    // In a real implementation, this would update the database
    // For now, just log the update
    console.log('✅ Shipment status updated:', { trackingId, status, location, description });
  }
}

export const fulfillmentOptimizer = FulfillmentOptimizer.getInstance();