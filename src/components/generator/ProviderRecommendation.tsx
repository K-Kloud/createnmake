import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useProviderRecommendation } from "@/hooks/useProviderRecommendation";

interface ProviderRecommendationProps {
  selectedItem: string;
  selectedRatio: string;
  currentProvider: string;
  onProviderChange: (provider: string) => void;
}

export const ProviderRecommendation = ({
  selectedItem,
  selectedRatio,
  currentProvider,
  onProviderChange
}: ProviderRecommendationProps) => {
  const { recommendation, allMetrics, loading } = useProviderRecommendation(selectedItem, selectedRatio);

  if (loading || !recommendation) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <span className="text-sm text-muted-foreground">Analyzing best provider...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isRecommended = recommendation.provider === currentProvider;
  
  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'GPT-Image-1';
      case 'gemini': return 'Gemini 2.5 Flash';
      case 'xai': return 'Grok 4';
      default: return provider;
    }
  };

  const getProviderEmoji = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'gemini': return '✨';
      case 'xai': return '🚀';
      default: return '🎨';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${
      isRecommended 
        ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 shadow-sm' 
        : 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:border-primary/30'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className={`h-4 w-4 ${isRecommended ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm font-medium">
                {isRecommended ? 'Using recommended provider' : 'Recommended provider'}
              </span>
              {isRecommended && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getProviderEmoji(recommendation.provider)}</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">
                    {getProviderName(recommendation.provider)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {recommendation.score}% match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {recommendation.reason}
                </p>
              </div>
            </div>

            {recommendation.metrics && (
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{Math.round(recommendation.metrics.success_rate * 100)}%</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Success rate</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{recommendation.metrics.avg_generation_time.toFixed(1)}s</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Average generation time</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          {!isRecommended && (
            <button
              onClick={() => onProviderChange(recommendation.provider)}
              className="px-3 py-1 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
            >
              Use This
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};