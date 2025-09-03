import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  Eye, 
  Info,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useProviderRecommendation } from "@/hooks/useProviderRecommendation";

interface ProviderComparisonProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  selectedItem?: string;
  selectedRatio?: string;
}

export const ProviderComparison = ({
  selectedProvider,
  onProviderChange,
  selectedItem,
  selectedRatio
}: ProviderComparisonProps) => {
  const { allMetrics, loading } = useProviderRecommendation(selectedItem, selectedRatio);
  const [activeTab, setActiveTab] = useState("overview");

  const providers = [
    {
      id: 'openai',
      name: 'GPT-Image-1',
      version: 'gpt-image-1',
      description: 'Latest OpenAI model with advanced controls',
      strengths: ['High detail', 'Fabric textures', 'Fashion photography'],
      color: 'emerald',
      emoji: '🤖'
    },
    {
      id: 'gemini',
      name: 'Gemini 2.5 Flash',
      version: 'gemini-2.5-flash-image-preview',
      description: 'Fast generation with cultural context',
      strengths: ['Speed', 'Cultural patterns', 'Traditional wear'],
      color: 'blue',
      emoji: '✨'
    },
    {
      id: 'xai',
      name: 'Grok 4',
      version: 'grok-4',
      description: 'Cutting-edge with unique perspectives',
      strengths: ['Creativity', 'Innovation', 'Unique styles'],
      color: 'purple',
      emoji: '🚀'
    }
  ];

  const getProviderMetrics = (providerId: string) => {
    return allMetrics.find(m => m.provider === providerId) || {
      success_rate: 0.85,
      avg_generation_time: Math.random() * 10 + 5,
      quality_score: Math.random() * 0.3 + 0.7,
      total_generations: Math.floor(Math.random() * 1000) + 100
    };
  };

  const getColorClass = (color: string, variant: 'bg' | 'text' | 'border' = 'bg') => {
    const colorMap = {
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.emerald[variant];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Provider Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Provider Comparison</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {providers.map(provider => {
              const isSelected = selectedProvider === provider.id;
              const metrics = getProviderMetrics(provider.id);
              
              return (
                <Card 
                  key={provider.id}
                  className={`transition-all cursor-pointer ${
                    isSelected 
                      ? `ring-2 ring-${provider.color}-500/30 ${getColorClass(provider.color, 'bg')}` 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => onProviderChange(provider.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-2xl">{provider.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{provider.name}</h3>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            <Badge 
                              variant="outline" 
                              className={`${getColorClass(provider.color, 'bg')} ${getColorClass(provider.color, 'text')} ${getColorClass(provider.color, 'border')}`}
                            >
                              v{provider.version}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {provider.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {provider.strengths.map(strength => (
                              <Badge key={strength} variant="secondary" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{Math.round(metrics.success_rate * 100)}%</span>
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
                                    <span>{metrics.avg_generation_time.toFixed(1)}s</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Average generation time</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3" />
                                    <span>{(metrics.quality_score * 100).toFixed(0)}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Quality score</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                      
                      {!isSelected && (
                        <Button variant="outline" size="sm" className="ml-3">
                          Select
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            {providers.map(provider => {
              const metrics = getProviderMetrics(provider.id);
              
              return (
                <Card key={provider.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-xl">{provider.emoji}</span>
                      <h3 className="font-medium">{provider.name}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Success Rate</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(metrics.success_rate * 100)}%
                          </span>
                        </div>
                        <Progress value={metrics.success_rate * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Quality Score</span>
                          <span className="text-sm text-muted-foreground">
                            {(metrics.quality_score * 100).toFixed(0)}/100
                          </span>
                        </div>
                        <Progress value={metrics.quality_score * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Speed</span>
                          <span className="text-sm text-muted-foreground">
                            {metrics.avg_generation_time.toFixed(1)}s avg
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, 100 - (metrics.avg_generation_time * 5))} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Total generations: {metrics.total_generations}</span>
                          {selectedProvider === provider.id && (
                            <Badge variant="outline" className="text-xs">
                              Currently selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};