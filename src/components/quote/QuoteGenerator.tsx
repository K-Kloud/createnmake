import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Zap, Clock, Target } from 'lucide-react';
import { useQuoteGeneration } from '@/hooks/useQuoteGeneration';
import { QuoteRequest } from '@/services/quoteEngine';

interface QuoteGeneratorProps {
  initialRequest?: Partial<QuoteRequest>;
  onQuoteGenerated?: (quote: any) => void;
}

export const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({
  initialRequest,
  onQuoteGenerated
}) => {
  const { generating, generateQuote } = useQuoteGeneration();
  
  const [request, setRequest] = useState<QuoteRequest>({
    materials: initialRequest?.materials || [],
    dimensions: initialRequest?.dimensions || { width: 0, height: 0 },
    quantity: initialRequest?.quantity || 1,
    timeline: initialRequest?.timeline || 14,
    qualityLevel: initialRequest?.qualityLevel || 'premium',
    customizations: initialRequest?.customizations || []
  });

  const [newMaterial, setNewMaterial] = useState('');
  const [newCustomization, setNewCustomization] = useState('');

  const handleAddMaterial = () => {
    if (newMaterial.trim() && !request.materials.includes(newMaterial.trim())) {
      setRequest(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()]
      }));
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (material: string) => {
    setRequest(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m !== material)
    }));
  };

  const handleAddCustomization = () => {
    if (newCustomization.trim()) {
      setRequest(prev => ({
        ...prev,
        customizations: [...(prev.customizations || []), newCustomization.trim()]
      }));
      setNewCustomization('');
    }
  };

  const handleRemoveCustomization = (customization: string) => {
    setRequest(prev => ({
      ...prev,
      customizations: (prev.customizations || []).filter(c => c !== customization)
    }));
  };

  const handleGenerateQuote = async () => {
    const quote = await generateQuote(request);
    if (quote && onQuoteGenerated) {
      onQuoteGenerated(quote);
    }
  };

  const isValid = request.materials.length > 0 && request.quantity > 0 && 
                  request.dimensions.width > 0 && request.dimensions.height > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Smart Quote Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Materials Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Materials</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add material (e.g., cotton, silk)"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMaterial()}
            />
            <Button onClick={handleAddMaterial} variant="outline" size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {request.materials.map((material) => (
              <Badge 
                key={material} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveMaterial(material)}
              >
                {material} ×
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Dimensions Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Dimensions (inches)</Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
              <Input
                id="width"
                type="number"
                value={request.dimensions.width || ''}
                onChange={(e) => setRequest(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, width: Number(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
              <Input
                id="height"
                type="number"
                value={request.dimensions.height || ''}
                onChange={(e) => setRequest(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, height: Number(e.target.value) }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="depth" className="text-xs text-muted-foreground">Depth (optional)</Label>
              <Input
                id="depth"
                type="number"
                value={request.dimensions.depth || ''}
                onChange={(e) => setRequest(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, depth: Number(e.target.value) || undefined }
                }))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Quantity and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={request.quantity}
              onChange={(e) => setRequest(prev => ({
                ...prev,
                quantity: Math.max(1, Number(e.target.value))
              }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline (days)</Label>
            <Input
              id="timeline"
              type="number"
              min="1"
              value={request.timeline}
              onChange={(e) => setRequest(prev => ({
                ...prev,
                timeline: Math.max(1, Number(e.target.value))
              }))}
            />
          </div>
        </div>

        {/* Quality Level */}
        <div className="space-y-2">
          <Label>Quality Level</Label>
          <Select 
            value={request.qualityLevel} 
            onValueChange={(value: any) => setRequest(prev => ({ ...prev, qualityLevel: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Basic - Cost-effective
                </span>
              </SelectItem>
              <SelectItem value="premium">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Premium - Balanced quality
                </span>
              </SelectItem>
              <SelectItem value="luxury">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Luxury - Highest quality
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customizations */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Special Requirements</Label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add customization or special requirement"
              value={newCustomization}
              onChange={(e) => setNewCustomization(e.target.value)}
              rows={2}
            />
            <Button onClick={handleAddCustomization} variant="outline" size="sm">
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {(request.customizations || []).map((customization, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{customization}</span>
                <Button
                  onClick={() => handleRemoveCustomization(customization)}
                  variant="ghost"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateQuote}
          disabled={!isValid || generating}
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Generating Quote...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Generate Smart Quote
            </>
          )}
        </Button>

        {!isValid && (
          <p className="text-sm text-muted-foreground text-center">
            Please provide materials, dimensions, and quantity to generate a quote.
          </p>
        )}
      </CardContent>
    </Card>
  );
};