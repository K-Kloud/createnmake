import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Truck, 
  Leaf, 
  DollarSign, 
  Clock, 
  Star,
  Shield,
  Zap,
  BarChart3
} from 'lucide-react';
import { useFulfillmentTracking } from '@/hooks/useFulfillmentTracking';
import { FulfillmentRequest } from '@/services/fulfillmentOptimizer';

interface FulfillmentOptimizerProps {
  orderId: string;
  onPlanGenerated?: (plan: any) => void;
}

export const FulfillmentOptimizer: React.FC<FulfillmentOptimizerProps> = ({
  orderId,
  onPlanGenerated
}) => {
  const { fulfillmentPlan, optimizing, optimizeFulfillment, getCostBreakdown, getSustainabilityScore } = useFulfillmentTracking();
  
  const [request, setRequest] = useState<FulfillmentRequest>({
    orderId,
    items: [{
      productId: 'prod-1',
      quantity: 1,
      dimensions: { length: 12, width: 8, height: 2 },
      weight: 0.5,
      fragile: false,
      value: 25.00
    }],
    destination: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    customerPreferences: {
      speed: 'standard',
      cost: 'balanced',
      sustainability: 'standard'
    }
  });

  const handleOptimize = async () => {
    const plan = await optimizeFulfillment(request);
    if (plan && onPlanGenerated) {
      onPlanGenerated(plan);
    }
  };

  const updateDestination = (field: string, value: string) => {
    setRequest(prev => ({
      ...prev,
      destination: { ...prev.destination, [field]: value }
    }));
  };

  const updatePreferences = (field: string, value: string) => {
    setRequest(prev => ({
      ...prev,
      customerPreferences: { ...prev.customerPreferences, [field]: value }
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setRequest(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const isValid = request.destination.zipCode && request.destination.state && request.items.length > 0;
  const costBreakdown = getCostBreakdown();
  const sustainabilityScore = getSustainabilityScore();

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Fulfillment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Order Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order-id">Order ID</Label>
                <Input id="order-id" value={orderId} disabled className="bg-muted" />
              </div>
              <div>
                <Label htmlFor="item-count">Items</Label>
                <Input 
                  id="item-count" 
                  value={`${request.items.length} item(s)`} 
                  disabled 
                  className="bg-muted" 
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Item Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Item Details</h4>
            {request.items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Weight (lbs)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Value ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.value}
                      onChange={(e) => updateItem(index, 'value', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`fragile-${index}`}
                      checked={item.fragile}
                      onChange={(e) => updateItem(index, 'fragile', e.target.checked)}
                    />
                    <Label htmlFor={`fragile-${index}`} className="text-xs">Fragile</Label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Dimensions (L × W × H inches)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Length"
                      value={item.dimensions.length}
                      onChange={(e) => updateItem(index, 'dimensions', {
                        ...item.dimensions,
                        length: Number(e.target.value)
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Width"
                      value={item.dimensions.width}
                      onChange={(e) => updateItem(index, 'dimensions', {
                        ...item.dimensions,
                        width: Number(e.target.value)
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Height"
                      value={item.dimensions.height}
                      onChange={(e) => updateItem(index, 'dimensions', {
                        ...item.dimensions,
                        height: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Destination */}
          <div className="space-y-4">
            <h4 className="font-medium">Destination</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={request.destination.city}
                  onChange={(e) => updateDestination('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={request.destination.state} onValueChange={(value) => updateDestination('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={request.destination.zipCode}
                  onChange={(e) => updateDestination('zipCode', e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={request.destination.country} onValueChange={(value) => updateDestination('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium">Customer Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Delivery Speed</Label>
                <Select 
                  value={request.customerPreferences.speed} 
                  onValueChange={(value: any) => updatePreferences('speed', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Standard (5-7 days)
                      </span>
                    </SelectItem>
                    <SelectItem value="fast">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Fast (2-3 days)
                      </span>
                    </SelectItem>
                    <SelectItem value="express">
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Express (1-2 days)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cost Priority</Label>
                <Select 
                  value={request.customerPreferences.cost} 
                  onValueChange={(value: any) => updatePreferences('cost', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Economy
                      </span>
                    </SelectItem>
                    <SelectItem value="balanced">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Balanced
                      </span>
                    </SelectItem>
                    <SelectItem value="premium">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Premium
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sustainability</Label>
                <Select 
                  value={request.customerPreferences.sustainability} 
                  onValueChange={(value: any) => updatePreferences('sustainability', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="eco_preferred">
                      <span className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        Eco-Preferred
                      </span>
                    </SelectItem>
                    <SelectItem value="carbon_neutral_only">
                      <span className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Carbon Neutral Only
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Optimize Button */}
          <Button 
            onClick={handleOptimize}
            disabled={!isValid || optimizing}
            className="w-full"
            size="lg"
          >
            {optimizing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Optimizing Fulfillment...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Optimize Fulfillment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {fulfillmentPlan && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">${fulfillmentPlan.totalCost}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                {costBreakdown && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Packaging: ${costBreakdown.packaging} • Shipping: ${costBreakdown.shipping}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="text-2xl font-bold">
                      {fulfillmentPlan.recommendedShipping.estimatedDays}d
                    </p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(fulfillmentPlan.estimatedDelivery).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sustainability</p>
                    <p className="text-2xl font-bold">
                      {sustainabilityScore?.overall || 0}%
                    </p>
                  </div>
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {fulfillmentPlan.carbonFootprint}kg CO₂
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Options */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Packaging */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Packaging
                </h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{fulfillmentPlan.recommendedPackaging.material}</span>
                    <Badge variant="outline">${fulfillmentPlan.recommendedPackaging.cost}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Type: {fulfillmentPlan.recommendedPackaging.type}</div>
                    <div>Protection: {fulfillmentPlan.recommendedPackaging.protection}</div>
                    <div>Weight: {fulfillmentPlan.recommendedPackaging.weight} lbs</div>
                    <div>
                      Sustainability: {Math.round(fulfillmentPlan.recommendedPackaging.sustainability * 100)}%
                    </div>
                  </div>
                  {fulfillmentPlan.recommendedPackaging.customization.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Includes: </span>
                      {fulfillmentPlan.recommendedPackaging.customization.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping
                </h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {fulfillmentPlan.recommendedShipping.carrier} {fulfillmentPlan.recommendedShipping.service}
                    </span>
                    <Badge variant="outline">${fulfillmentPlan.recommendedShipping.cost}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>Delivery: {fulfillmentPlan.recommendedShipping.estimatedDays} days</div>
                    <div>Tracking: {fulfillmentPlan.recommendedShipping.trackingIncluded ? 'Yes' : 'No'}</div>
                    <div>Insurance: {fulfillmentPlan.recommendedShipping.insuranceIncluded ? 'Yes' : 'No'}</div>
                    <div>Reliability: {Math.round(fulfillmentPlan.recommendedShipping.reliability * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* Optimization Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Optimization Score</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(fulfillmentPlan.optimizationScore * 100)}% 
                    (Confidence: {Math.round(fulfillmentPlan.confidence * 100)}%)
                  </span>
                </div>
                <Progress value={fulfillmentPlan.optimizationScore * 100} className="h-2" />
              </div>

              {/* Instructions */}
              {fulfillmentPlan.instructions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Fulfillment Instructions</h4>
                  <div className="space-y-2">
                    {fulfillmentPlan.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alternative Options */}
          {(fulfillmentPlan.alternatives.packaging.length > 0 || fulfillmentPlan.alternatives.shipping.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Alternative Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fulfillmentPlan.alternatives.packaging.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Alternative Packaging</h4>
                    <div className="space-y-2">
                      {fulfillmentPlan.alternatives.packaging.slice(0, 2).map((pkg, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <span className="font-medium">{pkg.material}</span>
                            <span className="text-sm text-muted-foreground ml-2">({pkg.type})</span>
                          </div>
                          <Badge variant="outline">${pkg.cost}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fulfillmentPlan.alternatives.shipping.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Alternative Shipping</h4>
                    <div className="space-y-2">
                      {fulfillmentPlan.alternatives.shipping.slice(0, 2).map((ship, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <span className="font-medium">{ship.carrier} {ship.service}</span>
                            <span className="text-sm text-muted-foreground ml-2">({ship.estimatedDays}d)</span>
                          </div>
                          <Badge variant="outline">${ship.cost}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};