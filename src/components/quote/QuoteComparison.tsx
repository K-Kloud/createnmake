import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Award, 
  Target,
  CheckCircle2
} from 'lucide-react';
import { QuoteResult } from '@/services/quoteEngine';

interface QuoteComparisonProps {
  comparison: {
    bestValue: QuoteResult;
    fastest: QuoteResult;
    cheapest: QuoteResult;
    analysis: string;
  };
  quotes: QuoteResult[];
  onSelectQuote?: (quote: QuoteResult) => void;
}

export const QuoteComparison: React.FC<QuoteComparisonProps> = ({
  comparison,
  quotes,
  onSelectQuote
}) => {
  const getQuoteLabel = (quote: QuoteResult) => {
    const labels: string[] = [];
    
    if (quote.id === comparison.bestValue.id) labels.push('Best Value');
    if (quote.id === comparison.fastest.id) labels.push('Fastest');
    if (quote.id === comparison.cheapest.id) labels.push('Cheapest');
    
    return labels;
  };

  const getQuoteIcon = (quote: QuoteResult) => {
    if (quote.id === comparison.bestValue.id) return Award;
    if (quote.id === comparison.fastest.id) return Clock;
    if (quote.id === comparison.cheapest.id) return DollarSign;
    return Target;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quote Comparison Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Analysis Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm leading-relaxed">{comparison.analysis}</p>
        </div>

        <Separator />

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Best Value */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">Best Value</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">${comparison.bestValue.finalPrice}</div>
              <div className="text-sm text-muted-foreground">{comparison.bestValue.timeline} days</div>
              <div className="text-xs">
                {Math.round(comparison.bestValue.confidence * 100)}% confidence
              </div>
            </div>
          </div>

          {/* Fastest */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">Fastest</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">${comparison.fastest.finalPrice}</div>
              <div className="text-sm text-muted-foreground">{comparison.fastest.timeline} days</div>
              <div className="text-xs">
                {Math.round(comparison.fastest.confidence * 100)}% confidence
              </div>
            </div>
          </div>

          {/* Cheapest */}
          <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-600">Cheapest</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">${comparison.cheapest.finalPrice}</div>
              <div className="text-sm text-muted-foreground">{comparison.cheapest.timeline} days</div>
              <div className="text-xs">
                {Math.round(comparison.cheapest.confidence * 100)}% confidence
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Detailed Comparison Table */}
        <div className="space-y-4">
          <h4 className="font-medium">All Quotes Comparison</h4>
          
          <div className="space-y-3">
            {quotes.map((quote) => {
              const labels = getQuoteLabel(quote);
              const QuoteIcon = getQuoteIcon(quote);
              
              return (
                <div key={quote.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <QuoteIcon className="h-4 w-4" />
                      <span className="font-medium">Quote #{quote.id.slice(-8)}</span>
                      <div className="flex gap-1">
                        {labels.map((label) => (
                          <Badge key={label} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {onSelectQuote && (
                      <Button
                        onClick={() => onSelectQuote(quote)}
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Select
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Price</div>
                      <div className="font-medium">${quote.finalPrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Timeline</div>
                      <div className="font-medium">{quote.timeline} days</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="font-medium">{Math.round(quote.confidence * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Valid Until</div>
                      <div className="font-medium text-xs">
                        {new Date(quote.validUntil).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <div>Materials: ${quote.breakdown.materials}</div>
                    <div>Labor: ${quote.breakdown.labor}</div>
                    <div>Overhead: ${quote.breakdown.overhead}</div>
                    <div>
                      {quote.breakdown.customizations > 0 && (
                        <>Custom: ${quote.breakdown.customizations}</>
                      )}
                      {quote.breakdown.urgency > 0 && (
                        <>Rush: +${quote.breakdown.urgency}</>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Decision Help */}
        <div className="space-y-3">
          <h4 className="font-medium">Decision Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-primary/5 rounded">
              <div className="font-medium text-primary mb-1">Choose Best Value if:</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• You want optimal price-quality balance</li>
                <li>• Timeline is flexible</li>
                <li>• Quality matters most</li>
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium text-green-600 mb-1">Choose Fastest if:</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• You have urgent deadline</li>
                <li>• Budget is flexible</li>
                <li>• Speed is priority</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="font-medium text-blue-600 mb-1">Choose Cheapest if:</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Budget is tight</li>
                <li>• Timeline is flexible</li>
                <li>• Cost is main concern</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};