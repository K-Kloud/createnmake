import { useState, useCallback, useEffect } from 'react';
import { fulfillmentOptimizer, FulfillmentPlan, ShipmentTracking, FulfillmentRequest } from '@/services/fulfillmentOptimizer';
import { useToast } from '@/components/ui/use-toast';

export const useFulfillmentTracking = () => {
  const [fulfillmentPlan, setFulfillmentPlan] = useState<FulfillmentPlan | null>(null);
  const [shipment, setShipment] = useState<ShipmentTracking | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [tracking, setTracking] = useState(false);
  const { toast } = useToast();

  // Real-time tracking updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (tracking && shipment) {
      interval = setInterval(async () => {
        try {
          // In a real implementation, this would call an API to update tracking
          console.log('Checking for tracking updates...');
        } catch (error) {
          console.error('Failed to update tracking:', error);
        }
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tracking, shipment]);

  const optimizeFulfillment = useCallback(async (request: FulfillmentRequest) => {
    if (!request.orderId || !request.items.length) {
      toast({
        variant: "destructive",
        title: "Invalid Request",
        description: "Please provide order ID and items for fulfillment optimization.",
      });
      return null;
    }

    setOptimizing(true);
    try {
      console.log("📦 Starting fulfillment optimization:", request);
      
      const plan = await fulfillmentOptimizer.optimizeFulfillment(request);
      setFulfillmentPlan(plan);
      
      toast({
        title: "Fulfillment Optimized",
        description: `Best option: ${plan.recommendedShipping.carrier} ${plan.recommendedShipping.service} - $${plan.totalCost}`,
      });
      
      return plan;
    } catch (error) {
      console.error("❌ Fulfillment optimization failed:", error);
      
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: "Unable to optimize fulfillment. Please try again.",
      });
      
      return null;
    } finally {
      setOptimizing(false);
    }
  }, [toast]);

  const createShipment = useCallback(async (plan?: FulfillmentPlan, actualWeight?: number) => {
    const planToUse = plan || fulfillmentPlan;
    
    if (!planToUse) {
      toast({
        variant: "destructive",
        title: "No Fulfillment Plan",
        description: "Please optimize fulfillment first before creating shipment.",
      });
      return null;
    }

    try {
      console.log("🚚 Creating shipment for plan:", planToUse.id);
      
      const newShipment = await fulfillmentOptimizer.createShipment(planToUse, actualWeight);
      setShipment(newShipment);
      
      toast({
        title: "Shipment Created",
        description: `Tracking: ${newShipment.trackingNumber} via ${newShipment.carrier}`,
      });
      
      return newShipment;
    } catch (error) {
      console.error("❌ Shipment creation failed:", error);
      
      toast({
        variant: "destructive",
        title: "Shipment Creation Failed",
        description: "Unable to create shipment. Please try again.",
      });
      
      return null;
    }
  }, [fulfillmentPlan, toast]);

  const updateShipmentStatus = useCallback(async (
    status: ShipmentTracking['status'],
    location?: string,
    description?: string
  ) => {
    if (!shipment) {
      toast({
        variant: "destructive",
        title: "No Shipment",
        description: "No active shipment to update.",
      });
      return;
    }

    try {
      await fulfillmentOptimizer.updateShipmentStatus(shipment.id, status, location, description);
      
      // Update local shipment state
      const updatedShipment = {
        ...shipment,
        status,
        currentLocation: location,
        events: [
          ...shipment.events,
          {
            timestamp: new Date().toISOString(),
            location: location || 'Unknown',
            status,
            description: description || `Status updated to ${status}`
          }
        ]
      };
      
      setShipment(updatedShipment);
      
      toast({
        title: "Status Updated",
        description: `Shipment status changed to ${status}`,
      });
    } catch (error) {
      console.error("❌ Status update failed:", error);
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Unable to update shipment status.",
      });
    }
  }, [shipment, toast]);

  const startTracking = useCallback(() => {
    if (!shipment) {
      toast({
        variant: "destructive",
        title: "No Shipment",
        description: "No shipment to track.",
      });
      return;
    }

    setTracking(true);
    toast({
      title: "Tracking Started",
      description: "Real-time shipment tracking is now active",
    });
  }, [shipment, toast]);

  const stopTracking = useCallback(() => {
    setTracking(false);
    toast({
      title: "Tracking Stopped",
      description: "Shipment tracking has been stopped",
    });
  }, [toast]);

  const getEstimatedDelivery = useCallback(() => {
    if (!fulfillmentPlan && !shipment) return null;
    
    const estimatedDate = shipment?.estimatedDelivery || fulfillmentPlan?.estimatedDelivery;
    return estimatedDate ? new Date(estimatedDate) : null;
  }, [fulfillmentPlan, shipment]);

  const getShipmentProgress = useCallback(() => {
    if (!shipment) return 0;
    
    const statusProgress = {
      'preparing': 10,
      'shipped': 25,
      'in_transit': 60,
      'out_for_delivery': 85,
      'delivered': 100,
      'exception': 50
    };
    
    return statusProgress[shipment.status] || 0;
  }, [shipment]);

  const isDelivered = useCallback(() => {
    return shipment?.status === 'delivered';
  }, [shipment]);

  const hasException = useCallback(() => {
    return shipment?.status === 'exception';
  }, [shipment]);

  const getTrackingUrl = useCallback(() => {
    if (!shipment) return null;
    
    const baseUrls = {
      'UPS': 'https://www.ups.com/track?track=yes&trackNums=',
      'FedEx': 'https://www.fedex.com/fedextrack/?tracknumber=',
      'USPS': 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1='
    };
    
    const baseUrl = baseUrls[shipment.carrier as keyof typeof baseUrls];
    return baseUrl ? `${baseUrl}${shipment.trackingNumber}` : null;
  }, [shipment]);

  const getCostBreakdown = useCallback(() => {
    if (!fulfillmentPlan) return null;
    
    return {
      packaging: fulfillmentPlan.recommendedPackaging.cost,
      shipping: fulfillmentPlan.recommendedShipping.cost,
      total: fulfillmentPlan.totalCost,
      savings: fulfillmentPlan.alternatives.shipping.length > 0 ? 
        Math.max(0, fulfillmentPlan.alternatives.shipping[0].cost - fulfillmentPlan.recommendedShipping.cost) : 0
    };
  }, [fulfillmentPlan]);

  const getSustainabilityScore = useCallback(() => {
    if (!fulfillmentPlan) return null;
    
    const packagingScore = fulfillmentPlan.recommendedPackaging.sustainability;
    const shippingScore = fulfillmentPlan.recommendedShipping.sustainability === 'carbon_neutral' ? 1 : 0.6;
    
    return {
      overall: Math.round(((packagingScore + shippingScore) / 2) * 100),
      packaging: Math.round(packagingScore * 100),
      shipping: Math.round(shippingScore * 100),
      carbonFootprint: fulfillmentPlan.carbonFootprint
    };
  }, [fulfillmentPlan]);

  return {
    fulfillmentPlan,
    shipment,
    optimizing,
    tracking,
    optimizeFulfillment,
    createShipment,
    updateShipmentStatus,
    startTracking,
    stopTracking,
    getEstimatedDelivery,
    getShipmentProgress,
    isDelivered,
    hasException,
    getTrackingUrl,
    getCostBreakdown,
    getSustainabilityScore
  };
};