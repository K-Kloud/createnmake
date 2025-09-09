import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSmartProviderFallback } from '@/hooks/useSmartProviderFallback';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface ProviderRecommendationProps {
  selectedItem: string;
  selectedRatio: string;
  currentProvider: string;
  onProviderChange: (provider: string) => void;
  hasReferenceImage?: boolean;
}

const getItemRecommendations = (item: string): { provider: string; reason: string }[] => {
  const itemLower = item.toLowerCase();
  
  if (itemLower.includes('fashion') || itemLower.includes('clothing') || itemLower.includes('outfit')) {
    return [
      { provider: 'openai', reason: 'Excellent for fashion detail and fabric textures' },
      { provider: 'gemini', reason: 'Great color accuracy for clothing items' }
    ];
  }
  
  if (itemLower.includes('portrait') || itemLower.includes('face') || itemLower.includes('person')) {
    return [
      { provider: 'openai', reason: 'Superior facial feature rendering' },
      { provider: 'gemini', reason: 'Natural skin tones and expressions' }
    ];
  }
  
  if (itemLower.includes('landscape') || itemLower.includes('nature') || itemLower.includes('outdoor')) {
    return [
      { provider: 'gemini', reason: 'Excellent landscape and nature scenes' },
      { provider: 'huggingface', reason: 'Great for artistic landscape styles' }
    ];
  }
  
  if (itemLower.includes('art') || itemLower.includes('painting') || itemLower.includes('drawing')) {
    return [
      { provider: 'huggingface', reason: 'Best for artistic and creative styles' },
      { provider: 'xai', reason: 'Good for experimental art styles' }
    ];
  }
  
  return [];
};

const getRatioRecommendations = (ratio: string): { provider: string; reason: string }[] => {
  if (ratio === '1:1') {
    return [
      { provider: 'openai', reason: 'Optimized for square formats' }
    ];
  }
  
  if (ratio === '16:9' || ratio === '21:9') {
    return [
      { provider: 'gemini', reason: 'Excellent wide-format composition' }
    ];
  }
  
  if (ratio === '9:16' || ratio === '3:4') {
    return [
      { provider: 'openai', reason: 'Great for portrait orientations' }
    ];
  }
  
  return [];
};

export const ProviderRecommendation: React.FC<ProviderRecommendationProps> = ({
  selectedItem,
  selectedRatio,
  currentProvider,
  onProviderChange,
  hasReferenceImage = false,
}) => {
  const { getRecommendedProvider, getProviderCapabilities } = useSmartProviderFallback(currentProvider, hasReferenceImage);
  
  const itemRecommendations = getItemRecommendations(selectedItem);
  const ratioRecommendations = getRatioRecommendations(selectedRatio);
  const smartRecommendedProvider = getRecommendedProvider(hasReferenceImage);
  
  // Combine all recommendations and filter for current context
  const allRecommendations = [...itemRecommendations, ...ratioRecommendations];
  const topRecommendation = allRecommendations.find(rec => rec.provider !== currentProvider);
  
  // Show smart recommendation for reference images
  const showReferenceRecommendation = hasReferenceImage && smartRecommendedProvider !== currentProvider;
  
  if (!topRecommendation && !showReferenceRecommendation) {
    return null;
  }
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Provider Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showReferenceRecommendation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  {smartRecommendedProvider.toUpperCase()}
                  <Badge variant="secondary" className="text-xs">
                    {getProviderCapabilities(smartRecommendedProvider).referenceImageType.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Recommended for reference image processing
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onProviderChange(smartRecommendedProvider)}
                className="gap-1"
              >
                Switch
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {topRecommendation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {topRecommendation.provider.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {topRecommendation.reason}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onProviderChange(topRecommendation.provider)}
                className="gap-1"
              >
                Switch
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          These recommendations are based on your selected item type, aspect ratio, and reference image usage.
        </div>
      </CardContent>
    </Card>
  );
};