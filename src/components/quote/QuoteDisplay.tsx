import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Info,
  Calendar,
  Package
} from 'lucide-react';
import { QuoteResult } from '@/services/quoteEngine';

interface QuoteDisplayProps {
  quote: QuoteResult;
  onAccept?: (quote: QuoteResult) => void;
  onRequestChanges?: (quote: QuoteResult) => void;
  showActions?: boolean;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({
  quote,
  onAccept,
  onRequestChanges,
  showActions = true
}) => {
  const confidenceColor = quote.confidence >= 0.8 ? 'text-green-600' : 
                         quote.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  const confidenceIcon = quote.confidence >= 0.8 ? CheckCircle : 
                         quote.confidence >= 0.6 ? AlertCircle : AlertCircle;

  const ConfidenceIcon = confidenceIcon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Quote #{quote.id.slice(-8)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <ConfidenceIcon className={`h-4 w-4 ${confidenceColor}`} />
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {Math.round(quote.confidence * 100)}% Confidence
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Price and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">
              ${quote.finalPrice.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Price</div>
            {quote.basePrice !== quote.finalPrice && (
              <div className="text-xs text-muted-foreground mt-1">
                Base: ${quote.basePrice.toLocaleString()}
              </div>
            )}
          </div>
          
          <div className="text-center p-4 bg-secondary/5 rounded-lg">
            <div className="text-3xl font-bold text-secondary-foreground">
              {quote.timeline}
            </div>
            <div className="text-sm text-muted-foreground">Days</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                Ready by {new Date(Date.now() + quote.timeline * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Price Breakdown
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Materials</span>
              <span className="font-medium">${quote.breakdown.materials}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Labor</span>
              <span className="font-medium">${quote.breakdown.labor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Overhead</span>
              <span className="font-medium">${quote.breakdown.overhead}</span>
            </div>
            {quote.breakdown.customizations > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Customizations</span>
                <span className="font-medium">${quote.breakdown.customizations}</span>
              </div>
            )}
            {quote.breakdown.urgency > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-600">Rush Premium</span>
                <span className="font-medium text-orange-600">+${quote.breakdown.urgency}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Confidence Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quote Accuracy</span>
            <span className="text-sm">{Math.round(quote.confidence * 100)}%</span>
          </div>
          <Progress value={quote.confidence * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Based on material complexity, design factors, and market conditions
          </p>
        </div>

        {/* Alternatives */}
        {quote.alternatives.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Alternative Options
              </h4>
              
              <div className="space-y-3">
                {quote.alternatives.map((alt, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{alt.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={alt.priceChange < 0 ? "default" : "secondary"}>
                          {alt.priceChange > 0 ? '+' : ''}${alt.priceChange.toFixed(0)}
                        </Badge>
                        <Badge variant="outline">
                          {alt.timelineChange > 0 ? '+' : ''}{alt.timelineChange}d
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alt.description}</p>
                    <div className="space-y-1">
                      {alt.modifications.map((mod, modIndex) => (
                        <div key={modIndex} className="text-xs bg-muted p-1 rounded">
                          • {mod}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quote Validity */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded">
          <Info className="h-4 w-4" />
          Quote valid until {new Date(quote.validUntil).toLocaleDateString()}
        </div>

        {/* Actions */}
        {showActions && (
          <>
            <Separator />
            <div className="flex gap-3">
              <Button 
                onClick={() => onAccept?.(quote)}
                className="flex-1"
                size="lg"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept Quote
              </Button>
              <Button 
                onClick={() => onRequestChanges?.(quote)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Request Changes
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};