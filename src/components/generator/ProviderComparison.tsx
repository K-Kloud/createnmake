import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSmartProviderFallback } from '@/hooks/useSmartProviderFallback';
import { ChevronDown, ChevronUp, Zap, Eye, Palette, Clock } from 'lucide-react';

interface ProviderComparisonProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  selectedItem: string;
  selectedRatio: string;
}

const providerDetails = {
  openai: {
    name: 'OpenAI DALL-E',
    strengths: ['High detail', 'Realistic textures', 'Fashion items', 'Portraits'],
    speed: 'Medium',
    quality: 'Excellent',
    specialty: 'Photorealism',
    icon: Eye,
    color: 'text-green-400'
  },
  gemini: {
    name: 'Google Gemini',
    strengths: ['Natural colors', 'Landscapes', 'Wide formats', 'Consistency'],
    speed: 'Fast',
    quality: 'Very Good',
    specialty: 'Natural scenes',
    icon: Palette,
    color: 'text-blue-400'
  },
  xai: {
    name: 'xAI Grok',
    strengths: ['Creative styles', 'Experimental', 'Artistic freedom', 'Unique aesthetics'],
    speed: 'Fast',
    quality: 'Good',
    specialty: 'Creativity',
    icon: Zap,
    color: 'text-purple-400'
  },
  huggingface: {
    name: 'Hugging Face',
    strengths: ['Open source', 'Art styles', 'Customizable', 'Community models'],
    speed: 'Variable',
    quality: 'Good',
    specialty: 'Art & Style',
    icon: Clock,
    color: 'text-orange-400'
  },
};

export const ProviderComparison: React.FC<ProviderComparisonProps> = ({
  selectedProvider,
  onProviderChange,
  selectedItem,
  selectedRatio,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { capabilities } = useSmartProviderFallback(selectedProvider, false);
  
  const providers = Object.keys(providerDetails);
  
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Provider Comparison
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            {providers.map((provider) => {
              const details = providerDetails[provider as keyof typeof providerDetails];
              const caps = capabilities[provider];
              const Icon = details.icon;
              const isSelected = provider === selectedProvider;
              
              return (
                <div
                  key={provider}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-border bg-card/50'
                  }`}
                  onClick={() => onProviderChange(provider)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${details.color}`} />
                      <div className="text-sm font-medium">
                        {details.name}
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {details.speed}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {details.specialty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Quality: {details.quality}
                      </Badge>
                      {caps?.supportsReferenceImages && (
                        <Badge variant="secondary" className="text-xs">
                          Ref Images
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Best for:</span>{' '}
                      {details.strengths.join(', ')}
                    </div>
                    
                    {caps?.supportsReferenceImages && (
                      <div className="text-xs text-primary">
                        Reference type: {caps.referenceImageType.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            Each provider has different strengths. Choose based on your content type and style preferences.
          </div>
        </CardContent>
      )}
    </Card>
  );
};